package com.c3d1.backend.admin;

import com.c3d1.backend.project.*;
import com.c3d1.backend.user.User;
import com.c3d1.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final TaskRepository taskRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SystemSettingsService systemSettingsService;
    private final StorageCleanupService storageCleanupService;

    public AdminSummaryResponse getSummary() {
        List<User> users = userRepository.findAll();
        List<Project> projects = projectRepository.findAll();
        List<Task> tasks = taskRepository.findAll();
        List<ChatMessage> messages = chatMessageRepository.findAll();
        List<ProjectMember> members = memberRepository.findAll();

        long adminUsers = users.stream().filter(user -> "ADMIN".equalsIgnoreCase(defaultRole(user.getRole()))).count();
        long lockedUsers = users.stream().filter(user -> "LOCKED".equalsIgnoreCase(defaultStatus(user.getAccountStatus()))).count();
        long activeProjects = projects.stream().filter(project -> "ACTIVE".equalsIgnoreCase(defaultStatus(project.getStatus()))).count();

        return AdminSummaryResponse.builder()
                .totalUsers(users.size())
                .adminUsers(adminUsers)
                .lockedUsers(lockedUsers)
                .totalProjects(projects.size())
                .activeProjects(activeProjects)
                .totalTasks(tasks.size())
                .totalMessages(messages.size())
                .totalMembers(members.size())
                .build();
    }

    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getId, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toUserResponse)
                .toList();
    }

    public AdminUserResponse updateUser(Long id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getRole() != null && !request.getRole().isBlank()) {
            user.setRole(request.getRole().toUpperCase(Locale.ROOT));
        }

        if (request.getAccountStatus() != null && !request.getAccountStatus().isBlank()) {
            user.setAccountStatus(request.getAccountStatus().toUpperCase(Locale.ROOT));
        }

        userRepository.save(user);
        return toUserResponse(user);
    }

    public List<AdminProjectResponse> getProjects() {
        return projectRepository.findAll().stream()
                .sorted(Comparator.comparing(Project::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toProjectResponse)
                .toList();
    }

    public AdminProjectResponse updateProject(Long projectId, AdminProjectUpdateRequest request) {
        Project project = getProjectOrThrow(projectId);

        if (request.getProjectName() != null) {
            if (request.getProjectName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project name is required");
            }
            project.setProjectName(request.getProjectName().trim());
        }

        if (request.getProjectDescription() != null) {
            project.setProjectDescription(request.getProjectDescription().trim());
        }

        if (request.getOwnerEmail() != null) {
            String ownerEmail = cleanEmail(request.getOwnerEmail());
            if (ownerEmail.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner email is required");
            }
            syncProjectOwner(project, ownerEmail);
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            project.setStatus(request.getStatus().toUpperCase(Locale.ROOT));
        }

        if (request.getVisibility() != null && !request.getVisibility().isBlank()) {
            project.setVisibility(request.getVisibility().toUpperCase(Locale.ROOT));
        }

        if (request.getLogoUrl() != null) {
            project.setLogoUrl(request.getLogoUrl().trim());
        }

        if (request.getPlanCode() != null && !request.getPlanCode().isBlank()) {
            project.setPlanCode(request.getPlanCode().toUpperCase(Locale.ROOT));
        }

        if (request.getBillingStatus() != null && !request.getBillingStatus().isBlank()) {
            project.setBillingStatus(request.getBillingStatus().toUpperCase(Locale.ROOT));
        }

        if (request.getMonthlyCost() != null) {
            project.setMonthlyCost(request.getMonthlyCost());
        }

        if (request.getOwnerAccessExpiresAt() != null) {
            project.setOwnerAccessExpiresAt(request.getOwnerAccessExpiresAt());
        }

        return toProjectResponse(projectRepository.save(project));
    }

    public List<ProjectMemberResponse> getProjectMembers(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }

        return memberRepository.findByProjectId(projectId).stream()
                .sorted(Comparator.comparing(ProjectMember::getRole, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(member -> ProjectMemberResponse.builder()
                        .id(member.getId())
                        .memberEmail(member.getMemberEmail())
                        .memberName(resolveName(member.getMemberEmail()))
                        .role(member.getRole())
                        .projectId(member.getProjectId())
                        .build())
                .toList();
    }

    public List<ProjectMemberResponse> addProjectMember(Long projectId, ProjectMemberUpsertRequest request) {
        Project project = getProjectOrThrow(projectId);
        String email = cleanEmail(request.getMemberEmail());

        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Member email is required");
        }

        String role = project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(email)
                ? "OWNER"
                : normalizeMemberRole(request.getRole());

        memberRepository.findByProjectIdAndMemberEmail(projectId, email)
                .ifPresentOrElse(
                        member -> {
                            member.setRole(role);
                            memberRepository.save(member);
                        },
                        () -> memberRepository.save(ProjectMember.builder()
                                .projectId(projectId)
                                .memberEmail(email)
                                .role(role)
                                .build())
                );

        return getProjectMembers(projectId);
    }

    public List<ProjectMemberResponse> updateProjectMember(
            Long projectId,
            Long memberId,
            ProjectMemberUpsertRequest request
    ) {
        Project project = getProjectOrThrow(projectId);
        ProjectMember member = getProjectMemberOrThrow(projectId, memberId);
        boolean ownerMember = project.getOwnerEmail() != null
                && project.getOwnerEmail().equalsIgnoreCase(member.getMemberEmail());

        if (ownerMember) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project owner cannot be edited here");
        }

        String email = cleanEmail(request.getMemberEmail());
        if (!email.isBlank()) {
            if (project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(email)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project owner already exists");
            }
            memberRepository.findByProjectIdAndMemberEmail(projectId, email)
                    .filter(existing -> !existing.getId().equals(memberId))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Member already exists in this project");
                    });
            member.setMemberEmail(email);
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            member.setRole(normalizeMemberRole(request.getRole()));
        }

        memberRepository.save(member);
        return getProjectMembers(projectId);
    }

    public List<ProjectMemberResponse> deleteProjectMember(Long projectId, Long memberId) {
        Project project = getProjectOrThrow(projectId);
        ProjectMember member = getProjectMemberOrThrow(projectId, memberId);

        if (project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(member.getMemberEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project owner cannot be removed");
        }

        memberRepository.delete(member);
        return getProjectMembers(projectId);
    }

    public List<AdminActivityResponse> getActivity() {
        List<AdminActivityResponse> taskActivity = taskRepository.findAll().stream()
                .sorted(Comparator.comparing(Task::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(10)
                .map(task -> {
                    String projectName = resolveProjectName(task.getProjectId());
                    return AdminActivityResponse.builder()
                            .type("TASK")
                            .title(task.getTitle())
                            .description(String.format(
                                    Locale.ROOT,
                                    "Giao cho %s · trạng thái %s",
                                    task.getAssigneeEmail() == null ? "chưa gán" : task.getAssigneeEmail(),
                                    task.getStatus()
                            ))
                            .projectId(task.getProjectId())
                            .projectName(projectName)
                            .actorEmail(task.getAssigneeEmail())
                            .occurredAt(task.getUpdatedAt())
                            .build();
                })
                .toList();

        List<AdminActivityResponse> messageActivity = chatMessageRepository.findAll().stream()
                .sorted(Comparator.comparing(ChatMessage::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(10)
                .map(message -> AdminActivityResponse.builder()
                        .type("MESSAGE")
                        .title(message.getSenderName() != null ? message.getSenderName() : message.getSenderEmail())
                        .description(message.getContent())
                        .projectId(message.getProjectId())
                        .projectName(resolveProjectName(message.getProjectId()))
                        .actorEmail(message.getSenderEmail())
                        .occurredAt(message.getCreatedAt())
                        .build())
                .toList();

        return mergeActivity(taskActivity, messageActivity);
    }

    public AdminSystemResponse getSystem() {
        AdminSummaryResponse summary = getSummary();
        SystemSettings settings = systemSettingsService.getSettings();
        return AdminSystemResponse.builder()
                .appName("C3D1")
                .authMode("JWT + Refresh Token")
                .totalUsers(summary.getTotalUsers())
                .totalProjects(summary.getTotalProjects())
                .totalTasks(summary.getTotalTasks())
                .totalMessages(summary.getTotalMessages())
                .totalMembers(summary.getTotalMembers())
                .allowRegistration(settings.isAllowRegistration())
                .maintenanceMode(settings.isMaintenanceMode())
                .deadlineReminders(settings.isDeadlineReminders())
                .reviewNotifications(settings.isReviewNotifications())
                .auditRetentionDays(settings.getAuditRetentionDays())
                .build();
    }

    public AdminSystemResponse updateSystemSettings(SystemSettingsRequest request) {
        systemSettingsService.updateSettings(request);
        return getSystem();
    }

    public StorageCleanupResponse cleanStorage() {
        return storageCleanupService.cleanOrphanFiles();
    }

    private AdminUserResponse toUserResponse(User user) {
        String email = user.getEmail();
        List<AdminUserMembershipResponse> memberships = buildUserMemberships(email);

        long taskCount = taskRepository.findAll().stream()
                .filter(task -> task.getAssigneeEmail() != null && task.getAssigneeEmail().equalsIgnoreCase(email))
                .count();

        long messageCount = chatMessageRepository.findAll().stream()
                .filter(message -> message.getSenderEmail() != null && message.getSenderEmail().equalsIgnoreCase(email))
                .count();

        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(email)
                .role(defaultRole(user.getRole()))
                .accountStatus(defaultStatus(user.getAccountStatus()))
                .projectCount(memberships.size())
                .taskCount(taskCount)
                .messageCount(messageCount)
                .memberships(memberships)
                .build();
    }

    private List<AdminUserMembershipResponse> buildUserMemberships(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }

        Map<Long, AdminUserMembershipResponse> membershipMap = new LinkedHashMap<>();

        for (Project project : projectRepository.findAll()) {
            if (project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(email)) {
                membershipMap.put(project.getId(), toUserMembership(project, email, "OWNER"));
            }
        }

        for (ProjectMember member : memberRepository.findByMemberEmail(email)) {
            Project project = projectRepository.findById(member.getProjectId()).orElse(null);
            if (project == null) {
                continue;
            }

            String role = membershipMap.containsKey(project.getId())
                    ? membershipMap.get(project.getId()).getRole()
                    : defaultIfBlank(member.getRole(), "MEMBER");
            membershipMap.put(project.getId(), toUserMembership(project, email, role));
        }

        return membershipMap.values().stream()
                .sorted(Comparator.comparing(AdminUserMembershipResponse::getProjectName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private AdminUserMembershipResponse toUserMembership(Project project, String email, String role) {
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtAsc(project.getId());
        long assignedTaskCount = tasks.stream()
                .filter(task -> task.getAssigneeEmail() != null && task.getAssigneeEmail().equalsIgnoreCase(email))
                .count();
        long messageCount = chatMessageRepository.findByProjectIdOrderByCreatedAtAsc(project.getId()).stream()
                .filter(message -> message.getSenderEmail() != null && message.getSenderEmail().equalsIgnoreCase(email))
                .count();

        return AdminUserMembershipResponse.builder()
                .projectId(project.getId())
                .projectName(project.getProjectName())
                .role(role)
                .assignedTaskCount(assignedTaskCount)
                .messageCount(messageCount)
                .build();
    }

    private AdminProjectResponse toProjectResponse(Project project) {
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtAsc(project.getId());
        long done = tasks.stream().filter(task -> "DONE".equalsIgnoreCase(task.getStatus())).count();
        long todo = tasks.stream().filter(task -> "TODO".equalsIgnoreCase(task.getStatus())).count();
        long inProgress = tasks.stream().filter(task -> "IN_PROGRESS".equalsIgnoreCase(task.getStatus())).count();
        long review = tasks.stream().filter(task -> "REVIEW".equalsIgnoreCase(task.getStatus())).count();
        long taskCount = tasks.size();
        double completionRate = taskCount == 0 ? 0 : Math.round((done * 1000.0 / taskCount)) / 10.0;

        return AdminProjectResponse.builder()
                .id(project.getId())
                .projectName(project.getProjectName())
                .projectDescription(project.getProjectDescription())
                .ownerEmail(project.getOwnerEmail())
                .inviteCode(project.getInviteCode())
                .status(defaultStatus(project.getStatus()))
                .visibility(defaultStatus(project.getVisibility()))
                .logoUrl(project.getLogoUrl())
                .planCode(defaultIfBlank(project.getPlanCode(), "FREE"))
                .billingStatus(defaultIfBlank(project.getBillingStatus(), "TRIAL"))
                .monthlyCost(project.getMonthlyCost())
                .ownerAccessExpiresAt(project.getOwnerAccessExpiresAt())
                .memberCount(memberRepository.countByProjectId(project.getId()))
                .taskCount(taskCount)
                .todoTaskCount(todo)
                .inProgressTaskCount(inProgress)
                .reviewTaskCount(review)
                .doneTaskCount(done)
                .messageCount(chatMessageRepository.countByProjectId(project.getId()))
                .completionRate(completionRate)
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private List<AdminActivityResponse> mergeActivity(
            List<AdminActivityResponse> taskActivity,
            List<AdminActivityResponse> messageActivity
    ) {
        return java.util.stream.Stream.concat(taskActivity.stream(), messageActivity.stream())
                .sorted(Comparator.comparing(AdminActivityResponse::getOccurredAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(30)
                .toList();
    }

    private String resolveProjectName(Long projectId) {
        if (projectId == null) {
            return "Unknown project";
        }

        return projectRepository.findById(projectId)
                .map(Project::getProjectName)
                .orElse("Unknown project");
    }

    private Project getProjectOrThrow(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    private ProjectMember getProjectMemberOrThrow(Long projectId, Long memberId) {
        ProjectMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        if (!projectId.equals(member.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Member does not belong to this project");
        }

        return member;
    }

    private String cleanEmail(String email) {
        return email == null ? "" : email.trim();
    }

    private String normalizeMemberRole(String role) {
        if (role == null || role.isBlank()) {
            return "MEMBER";
        }

        String normalized = role.toUpperCase(Locale.ROOT);
        if ("OWNER".equals(normalized)) {
            return "MEMBER";
        }

        return normalized;
    }

    private void syncProjectOwner(Project project, String ownerEmail) {
        String oldOwnerEmail = cleanEmail(project.getOwnerEmail());
        String newOwnerEmail = ownerEmail.trim();

        if (!oldOwnerEmail.isBlank() && !oldOwnerEmail.equalsIgnoreCase(newOwnerEmail)) {
            memberRepository.findByProjectIdAndMemberEmail(project.getId(), oldOwnerEmail)
                    .ifPresent(member -> {
                        member.setRole("MEMBER");
                        memberRepository.save(member);
                    });
        }

        memberRepository.findByProjectIdAndMemberEmail(project.getId(), newOwnerEmail)
                .ifPresentOrElse(
                        member -> {
                            member.setRole("OWNER");
                            memberRepository.save(member);
                        },
                        () -> memberRepository.save(ProjectMember.builder()
                                .projectId(project.getId())
                                .memberEmail(newOwnerEmail)
                                .role("OWNER")
                                .build())
                );

        project.setOwnerEmail(newOwnerEmail);
    }

    private String resolveName(String email) {
        if (email == null || email.isBlank()) {
            return "";
        }

        return userRepository.findByEmail(email)
                .map(User::getFullName)
                .filter(name -> name != null && !name.isBlank())
                .orElse(email);
    }

    private String defaultRole(String role) {
        return role == null || role.isBlank() ? "USER" : role.toUpperCase(Locale.ROOT);
    }

    private String defaultStatus(String status) {
        return status == null || status.isBlank() ? "ACTIVE" : status.toUpperCase(Locale.ROOT);
    }

    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
