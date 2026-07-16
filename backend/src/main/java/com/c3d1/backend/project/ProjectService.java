package com.c3d1.backend.project;

import com.c3d1.backend.admin.SystemSettingsService;
import com.c3d1.backend.user.User;
import com.c3d1.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.apache.poi.xwpf.usermodel.BodyElementType;
import org.apache.poi.xwpf.usermodel.IBodyElement;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;

import java.io.IOException;
import java.io.InputStream;
import javax.imageio.ImageIO;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final TaskRepository taskRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ProjectAnnouncementRepository announcementRepository;
    private final ProjectActivityRepository activityRepository;
    private final SubmissionCommentRepository submissionCommentRepository;
    private final TaskTemplateRepository taskTemplateRepository;
    private final ProjectNotificationService notificationService;
    private final ProjectAiService projectAiService;
    private final UserRepository userRepository;
    private final SystemSettingsService systemSettingsService;
    private final S3Client s3Client; // Giả sử bạn đã có bean này

    @Value("${c3d1.upload-dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_SUBMISSION_EXTENSIONS = Set.of(
            "pptx", "ppt", "docx", "doc", "xlsx", "xls", "pdf", "jpg", "jpeg", "zip", "rar"
    );
    private static final Set<String> PROJECT_ROLES = Set.of(
            "OWNER", "CO_OWNER", "MANAGER", "MEMBER", "VIEWER"
    );
    private static final Set<String> PROJECT_ADMINS = Set.of("OWNER", "CO_OWNER");
    private static final Set<String> DELIVERY_MANAGERS = Set.of("OWNER", "CO_OWNER", "MANAGER");

    public Project create(String projectName, String ownerEmail) {
        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);

        Project project = Project.builder()
                .projectName(projectName)
                .projectDescription("")
                .ownerEmail(ownerEmail)
                .inviteCode(code)
                .status("ACTIVE")
                .visibility("PRIVATE")
                .planCode("FREE")
                .billingStatus("TRIAL")
                .monthlyCost(BigDecimal.ZERO)
                .build();

        Project saved = projectRepository.save(project);

        if (ownerEmail != null && !ownerEmail.isBlank()) {
            ensureMember(saved.getId(), ownerEmail, "OWNER");
        }
        logActivity(saved.getId(), ownerEmail, "PROJECT_CREATED", "Created project", saved.getProjectName());

        return saved;
    }

    public Long join(String inviteCode, String email) {
        Project project = projectRepository.findByInviteCode(inviteCode).orElseThrow();
        ensureMember(project.getId(), email, "MEMBER");
        logActivity(project.getId(), email, "MEMBER_JOINED", "Joined project", email);
        return project.getId();
    }

    public Project getById(Long id) {
        return projectRepository.findById(id).orElseThrow();
    }

    public List<ProjectDashboardProjectResponse> getDashboardProjects(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }

        Set<Long> projectIds = new LinkedHashSet<>();
        projectRepository.findByOwnerEmail(email).forEach(project -> projectIds.add(project.getId()));
        memberRepository.findByMemberEmail(email).forEach(member -> projectIds.add(member.getProjectId()));

        return projectRepository.findAllById(projectIds).stream()
                .sorted(Comparator.comparing(Project::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(project -> toDashboardProjectResponse(project, email))
                .toList();
    }

    public ProjectSummaryResponse getSummary(Long projectId) {
        Project project = getById(projectId);
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId);

        long todo = countStatus(tasks, "TODO");
        long inProgress = countStatus(tasks, "IN_PROGRESS");
        long review = countStatus(tasks, "REVIEW");
        long done = countStatus(tasks, "DONE");
        long taskCount = tasks.size();
        double completionRate = taskCount == 0 ? 0 : Math.round((done * 1000.0 / taskCount)) / 10.0;

        return ProjectSummaryResponse.builder()
                .id(project.getId())
                .projectName(project.getProjectName())
                .ownerEmail(project.getOwnerEmail())
                .inviteCode(project.getInviteCode())
                .status(project.getStatus())
                .memberCount(memberRepository.countByProjectId(projectId))
                .taskCount(taskCount)
                .messageCount(chatMessageRepository.countByProjectId(projectId))
                .todoCount(todo)
                .inProgressCount(inProgress)
                .reviewCount(review)
                .doneCount(done)
                .completionRate(completionRate)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public ProjectSummaryResponse getSummary(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        ProjectSummaryResponse response = getSummary(projectId);
        response.setCurrentUserRole(resolveProjectRole(projectId, currentUserEmail));
        return response;
    }

    public List<ProjectMemberResponse> getMembers(Long projectId) {
        return memberRepository.findByProjectId(projectId).stream()
                .map(member -> ProjectMemberResponse.builder()
                        .id(member.getId())
                        .memberEmail(member.getMemberEmail())
                        .memberName(resolveName(member.getMemberEmail()))
                        .role(member.getRole())
                        .projectId(member.getProjectId())
                        .build())
                .toList();
    }

    public List<ProjectMemberResponse> getMembers(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        return getMembers(projectId);
    }

    public List<TaskResponse> getTasks(Long projectId) {
        return taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId).stream()
                .map(this::toTaskResponse)
                .toList();
    }

    public List<TaskResponse> getTasks(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        return getTasks(projectId);
    }

    public List<ProjectActivityResponse> getActivity(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        return activityRepository.findTop30ByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::toActivityResponse)
                .toList();
    }

    public TaskResponse createTask(Long projectId, TaskCreateRequest request, String currentUserEmail) {
        requireDeliveryManager(projectId, currentUserEmail);
        getById(projectId);

        Task task = Task.builder()
                .projectId(projectId)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(normalizeStatus(request.getStatus()))
                .priority(normalizePriority(request.getPriority()))
                .assigneeEmail(defaultIfBlank(request.getAssigneeEmail(), currentUserEmail))
                .dueDate(request.getDueDate())
                .requiredFileTypes(normalizeFileTypes(request.getRequiredFileTypes()))
                .submissionStatus("NOT_SUBMITTED")
                .build();

        Task saved = taskRepository.save(task);
        logActivity(projectId, currentUserEmail, "TASK_CREATED", "Created task", saved.getTitle());
        return toTaskResponse(saved);
    }

    public TaskResponse updateTask(Long projectId, Long taskId, TaskUpdateRequest request, String currentUserEmail) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId).orElseThrow();
        requireDeliveryManager(projectId, currentUserEmail);
        String previousAssignee = task.getAssigneeEmail();

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(normalizeStatus(request.getStatus()));
        }
        if (request.getPriority() != null) {
            task.setPriority(normalizePriority(request.getPriority()));
        }
        if (request.getAssigneeEmail() != null) {
            task.setAssigneeEmail(request.getAssigneeEmail());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getRequiredFileTypes() != null) {
            task.setRequiredFileTypes(normalizeFileTypes(request.getRequiredFileTypes()));
        }

        Task saved = taskRepository.save(task);
        boolean assigneeChanged = request.getAssigneeEmail() != null
                && !request.getAssigneeEmail().equalsIgnoreCase(defaultIfBlank(previousAssignee, ""));
        if (assigneeChanged) {
            logActivity(
                    projectId,
                    currentUserEmail,
                    "TASK_TRANSFERRED",
                    "Transferred task",
                    saved.getTitle() + " -> " + saved.getAssigneeEmail()
            );
            notificationService.notifyProject(projectId, "TASK_TRANSFERRED", Map.of(
                    "taskId", saved.getId(),
                    "taskTitle", saved.getTitle(),
                    "fromEmail", defaultIfBlank(previousAssignee, ""),
                    "toEmail", defaultIfBlank(saved.getAssigneeEmail(), ""),
                    "actorEmail", currentUserEmail
            ));
        } else {
            logActivity(projectId, currentUserEmail, "TASK_UPDATED", "Updated task", saved.getTitle());
        }
        return toTaskResponse(saved);
    }

    public void deleteTask(Long projectId, Long taskId, String currentUserEmail) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId).orElseThrow();
        requireDeliveryManager(projectId, currentUserEmail);
        String title = task.getTitle();
        deleteTaskSubmissionData(projectId, taskId, task.getSubmissionPath());
        taskRepository.delete(task);
        logActivity(projectId, currentUserEmail, "TASK_DELETED", "Deleted task", title);
    }

    public TaskResponse submitTaskFile(
            Long projectId,
            Long taskId,
            MultipartFile file,
            String note,
            String currentUserEmail
    ) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId).orElseThrow();
        requireTaskSubmissionPermission(projectId, task, currentUserEmail);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submission file is required");
        }

        String originalName = file.getOriginalFilename() == null ? "submission" : file.getOriginalFilename();
        String extension = getExtension(originalName);
        validateSubmissionExtension(task, extension);
        validateSubmissionContent(file, extension);
        String trustedContentType = trustedContentType(extension);

        // Tên bucket sẽ được cấu hình qua biến môi trường.
        String bucketName = System.getenv("S3_UPLOAD_BUCKET");
        if (bucketName == null || bucketName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload bucket is not configured");
        }
        String storedName = "project-" + projectId + "/task-" + taskId + "/" + UUID.randomUUID() + "-" + sanitizeFileName(originalName);

        try {
            // Logic upload file lên S3, bao gồm cả content type
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(storedName)
                            .contentType(trustedContentType)
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Cập nhật thông tin task và tạo bản ghi lịch sử nộp bài
            return updateTaskAfterSubmission(task, originalName, storedName, trustedContentType, file.getSize(), note, currentUserEmail);
        } catch (Exception exception) { // Bắt Exception chung hơn cho S3
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store submission file");
        }
    }

    public TaskResponse reviewTaskSubmission(
            Long projectId,
            Long taskId,
        TaskReviewRequest request,
        String currentUserEmail
    ) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId).orElseThrow();
        requireDeliveryManager(projectId, currentUserEmail);

        if (task.getSubmissionOriginalName() == null || task.getSubmissionOriginalName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task has no submitted file");
        }

        String status = request.getStatus() == null ? "" : request.getStatus().trim().toUpperCase(Locale.ROOT);
        if (!Set.of("APPROVED", "REJECTED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review status must be APPROVED or REJECTED");
        }

        task.setSubmissionStatus(status);
        task.setReviewNote(request.getReviewNote());
        task.setReviewedAt(LocalDateTime.now());
        task.setReviewedByEmail(currentUserEmail);
        task.setStatus("APPROVED".equals(status) ? "DONE" : "IN_PROGRESS");

        taskSubmissionRepository.findTopByProjectIdAndTaskIdOrderBySubmittedAtDesc(projectId, taskId)
                .ifPresent(submission -> {
                    submission.setStatus(status);
                    submission.setReviewNote(request.getReviewNote());
                    submission.setReviewedAt(task.getReviewedAt());
                    submission.setReviewedByEmail(currentUserEmail);
                    taskSubmissionRepository.save(submission);
                });

        Task saved = taskRepository.save(task);
        logActivity(
                projectId,
                currentUserEmail,
                "SUBMISSION_REVIEWED",
                "Reviewed submission",
                saved.getTitle() + " - " + status
        );
        if (systemSettingsService.getSettings().isReviewNotifications()) {
            notificationService.notifyProject(projectId, "SUBMISSION_REVIEWED", Map.of(
                    "taskId", saved.getId(),
                    "taskTitle", saved.getTitle(),
                    "status", status,
                    "actorEmail", currentUserEmail
            ));
        }
        return toTaskResponse(saved);
    }

    public List<TaskSubmissionResponse> getTaskSubmissions(Long projectId, Long taskId, String currentUserEmail) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId).orElseThrow();
        requireProjectMember(projectId, currentUserEmail);

        List<TaskSubmission> submissions = taskSubmissionRepository.findByProjectIdAndTaskIdOrderBySubmittedAtDesc(projectId, taskId);
        if (submissions.isEmpty() && task.getSubmissionOriginalName() != null && !task.getSubmissionOriginalName().isBlank()) {
            return List.of(toTaskSubmissionResponse(task));
        }

        return submissions.stream()
                .map(this::toTaskSubmissionResponse)
                .toList();
    }

    public ResponseEntity<Resource> downloadTaskSubmission(Long projectId, Long taskId, String currentUserEmail) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId).orElseThrow();
        requireProjectMember(projectId, currentUserEmail);

        if (task.getSubmissionPath() == null || task.getSubmissionPath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        // Tên bucket sẽ được cấu hình qua biến môi trường.
        String bucketName = System.getenv("S3_UPLOAD_BUCKET");
        if (bucketName == null || bucketName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload bucket is not configured");
        }
        String key = task.getSubmissionPath();

        try {
            // Lấy file từ S3 dưới dạng một luồng dữ liệu
            InputStream s3Object = s3Client.getObject(GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());

            Resource resource = new InputStreamResource(s3Object);

            String downloadName = safeResponseFileName(
                task.getSubmissionOriginalName() == null ? "submission" : task.getSubmissionOriginalName()
            );
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(defaultIfBlank(task.getSubmissionContentType(), "application/octet-stream")))
                    .contentLength(task.getSubmissionSize())
                    .header("X-Content-Type-Options", "nosniff")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                    .body(resource);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task submission file not found");
        }
    }

    public List<ChatMessageResponse> getMessages(Long projectId) {
        return chatMessageRepository.findByProjectIdOrderByCreatedAtAsc(projectId).stream()
                .map(this::toChatResponse)
                .toList();
    }

    public List<ChatMessageResponse> getMessages(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        return getMessages(projectId);
    }

    public ChatMessageResponse sendMessage(Long projectId, String senderEmail, String content) {
        requireProjectMember(projectId, senderEmail);
        requireNotViewer(projectId, senderEmail);
        getById(projectId);

        ChatMessage message = ChatMessage.builder()
                .projectId(projectId)
                .senderEmail(senderEmail)
                .senderName(resolveName(senderEmail))
                .content(content)
                .build();

        return toChatResponse(chatMessageRepository.save(message));
    }

    public ChatMessageResponse updateMessage(Long projectId, Long messageId, String content, String currentUserEmail) {
        ChatMessage message = chatMessageRepository.findById(messageId).orElseThrow();
        if (!projectId.equals(message.getProjectId())) {
            throw new IllegalArgumentException("Message does not belong to this project");
        }
        requireMessageEditPermission(message, currentUserEmail);
        if (content != null && !content.isBlank()) {
            message.setContent(content);
        }
        return toChatResponse(chatMessageRepository.save(message));
    }

    public void deleteMessage(Long projectId, Long messageId, String currentUserEmail) {
        ChatMessage message = chatMessageRepository.findById(messageId).orElseThrow();
        if (!projectId.equals(message.getProjectId())) {
            throw new IllegalArgumentException("Message does not belong to this project");
        }
        requireMessageEditPermission(message, currentUserEmail);
        chatMessageRepository.delete(message);
    }

    public List<ProjectAnnouncementResponse> getAnnouncements(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        return announcementRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::toAnnouncementResponse)
                .toList();
    }

    public ProjectAnnouncementResponse createAnnouncement(
            Long projectId,
            ProjectAnnouncementRequest request,
            String currentUserEmail
    ) {
        requireDeliveryManager(projectId, currentUserEmail);
        getById(projectId);

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Announcement title is required");
        }

        ProjectAnnouncement announcement = ProjectAnnouncement.builder()
                .projectId(projectId)
                .title(request.getTitle().trim())
                .content(defaultIfBlank(request.getContent(), ""))
                .createdByEmail(currentUserEmail)
                .createdByName(resolveName(currentUserEmail))
                .build();

        ProjectAnnouncement saved = announcementRepository.save(announcement);
        logActivity(projectId, currentUserEmail, "ANNOUNCEMENT_CREATED", "Posted announcement", saved.getTitle());
        return toAnnouncementResponse(saved);
    }

    public void deleteAnnouncement(Long projectId, Long announcementId, String currentUserEmail) {
        ProjectAnnouncement announcement = announcementRepository
                .findByIdAndProjectId(announcementId, projectId)
                .orElseThrow();
        requireDeliveryManager(projectId, currentUserEmail);
        announcementRepository.delete(announcement);
        logActivity(projectId, currentUserEmail, "ANNOUNCEMENT_DELETED", "Deleted announcement", announcement.getTitle());
    }

    public ProjectPerformanceResponse getPerformance(Long projectId) {
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
        long total = tasks.size();
        long todo = countStatus(tasks, "TODO");
        long inProgress = countStatus(tasks, "IN_PROGRESS");
        long review = countStatus(tasks, "REVIEW");
        long done = countStatus(tasks, "DONE");
        long members = memberRepository.countByProjectId(projectId);
        long messages = chatMessageRepository.countByProjectId(projectId);
        double completionRate = total == 0 ? 0 : Math.round((done * 1000.0 / total)) / 10.0;
        String health = determineHealth(completionRate, inProgress, review);
        String focus = determineFocus(todo, inProgress, review, done);
        String nextAction = determineNextAction(todo, inProgress, review, done, members, messages);
        String summary = String.format(
                Locale.ROOT,
                "Workspace đang có %d task, %d thành viên và %d tin nhắn. %s",
                total,
                members,
                messages,
                nextAction
        );

        LocalDate today = LocalDate.now();
        LocalDate dueSoonLimit = today.plusDays(1);
        long overdue = tasks.stream()
                .filter(task -> !"DONE".equals(task.getStatus()))
                .filter(task -> task.getDueDate() != null && task.getDueDate().isBefore(today))
                .count();
        long dueSoon = tasks.stream()
                .filter(task -> !"DONE".equals(task.getStatus()))
                .filter(task -> task.getDueDate() != null)
                .filter(task -> !task.getDueDate().isBefore(today) && !task.getDueDate().isAfter(dueSoonLimit))
                .count();
        long doneWithDeadline = tasks.stream()
                .filter(task -> "DONE".equals(task.getStatus()))
                .filter(task -> task.getDueDate() != null)
                .count();
        long onTimeDone = tasks.stream()
                .filter(task -> "DONE".equals(task.getStatus()))
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getUpdatedAt() == null || !task.getUpdatedAt().toLocalDate().isAfter(task.getDueDate()))
                .count();
        double onTimeRate = doneWithDeadline == 0
                ? 100.0
                : Math.round((onTimeDone * 1000.0 / doneWithDeadline)) / 10.0;

        return ProjectPerformanceResponse.builder()
                .projectId(projectId)
                .totalTasks(total)
                .todoTasks(todo)
                .inProgressTasks(inProgress)
                .reviewTasks(review)
                .doneTasks(done)
                .completionRate(completionRate)
                .memberCount(members)
                .messageCount(messages)
                .health(health)
                .focus(focus)
                .healthLabel(describeHealth(health))
                .focusLabel(describeFocus(focus))
                .nextAction(nextAction)
                .summary(summary)
                .signals(List.of(
                        "Todo: " + todo,
                        "In progress: " + inProgress,
                        "Review: " + review,
                        "Done: " + done,
                        "Overdue: " + overdue,
                        "Due in 24h: " + dueSoon,
                        "On-time rate: " + onTimeRate + "%"
                ))
                .overdueTasks(overdue)
                .dueSoonTasks(dueSoon)
                .onTimeRate(onTimeRate)
                .workloadAlerts(buildWorkloadAlerts(tasks))
                .build();
    }

    public ProjectPerformanceResponse getPerformance(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        return getPerformance(projectId);
    }

    public ProjectSettingsResponse getSettings(Long projectId) {
        Project project = getById(projectId);

        return ProjectSettingsResponse.builder()
                .id(project.getId())
                .projectName(project.getProjectName())
                .projectDescription(project.getProjectDescription())
                .ownerEmail(project.getOwnerEmail())
                .inviteCode(project.getInviteCode())
                .status(project.getStatus())
                .visibility(project.getVisibility())
                .logoUrl(project.getLogoUrl())
                .planCode(defaultStatus(project.getPlanCode(), "FREE"))
                .billingStatus(defaultStatus(project.getBillingStatus(), "TRIAL"))
                .monthlyCost(project.getMonthlyCost())
                .ownerAccessExpiresAt(project.getOwnerAccessExpiresAt())
                .memberCount(memberRepository.countByProjectId(projectId))
                .taskCount(taskRepository.countByProjectId(projectId))
                .messageCount(chatMessageRepository.countByProjectId(projectId))
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public ProjectSettingsResponse getSettings(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        return getSettings(projectId);
    }

    public ProjectSettingsResponse updateSettings(Long projectId, ProjectSettingsRequest request, String currentUserEmail) {
        Project project = getById(projectId);
        requireProjectAdmin(projectId, currentUserEmail);

        if (request.getProjectName() != null && !request.getProjectName().isBlank()) {
            project.setProjectName(request.getProjectName());
        }

        if (request.getProjectDescription() != null) {
            project.setProjectDescription(request.getProjectDescription());
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            project.setStatus(request.getStatus().toUpperCase(Locale.ROOT));
        }

        if (request.getVisibility() != null && !request.getVisibility().isBlank()) {
            project.setVisibility(request.getVisibility().toUpperCase(Locale.ROOT));
        }

        if (request.getLogoUrl() != null) {
            project.setLogoUrl(request.getLogoUrl());
        }

        projectRepository.save(project);
        logActivity(projectId, currentUserEmail, "SETTINGS_UPDATED", "Updated project settings", project.getProjectName());
        return getSettings(projectId);
    }

    public void deleteProject(Long projectId, String currentUserEmail) {
        requireOwner(projectId, currentUserEmail);

        taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId)
                .forEach(task -> deleteStoredFile(task.getSubmissionPath()));
        taskSubmissionRepository.findByProjectIdOrderBySubmittedAtDesc(projectId).forEach(submission -> {
            submissionCommentRepository.findBySubmissionIdOrderByCreatedAtAsc(submission.getId())
                    .forEach(submissionCommentRepository::delete);
            deleteStoredFile(submission.getPath());
            taskSubmissionRepository.delete(submission);
        });
        taskTemplateRepository.findByProjectIdOrderByCreatedAtDesc(projectId).forEach(taskTemplateRepository::delete);
        activityRepository.findByProjectIdOrderByCreatedAtDesc(projectId).forEach(activityRepository::delete);
        taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId).forEach(taskRepository::delete);
        chatMessageRepository.findByProjectIdOrderByCreatedAtAsc(projectId).forEach(chatMessageRepository::delete);
        announcementRepository.findByProjectIdOrderByCreatedAtDesc(projectId).forEach(announcementRepository::delete);
        memberRepository.findByProjectId(projectId).forEach(memberRepository::delete);
        projectRepository.deleteById(projectId);
    }

    public List<ProjectMemberResponse> addMember(Long projectId, ProjectMemberUpsertRequest request, String currentUserEmail) {
        Project project = getById(projectId);
        requireProjectAdmin(projectId, currentUserEmail);
        String email = request.getMemberEmail();
        String role = normalizeRole(request.getRole());

        if (email != null && !email.isBlank()) {
            ensureMember(project.getId(), email, role);
            logActivity(projectId, currentUserEmail, "MEMBER_ADDED", "Added member", email + " as " + role);
        }

        return getMembers(projectId);
    }

    public List<ProjectMemberResponse> updateMember(Long projectId, Long memberId, ProjectMemberUpsertRequest request, String currentUserEmail) {
        ProjectMember member = memberRepository.findById(memberId).orElseThrow();
        if (!projectId.equals(member.getProjectId())) {
            throw new IllegalArgumentException("Member does not belong to this project");
        }
        requireProjectAdmin(projectId, currentUserEmail);
        Project project = getById(projectId);
        if (project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(member.getMemberEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project owner role cannot be changed");
        }

        if (request.getMemberEmail() != null && !request.getMemberEmail().isBlank()) {
            member.setMemberEmail(request.getMemberEmail());
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            member.setRole(normalizeRole(request.getRole()));
        }

        memberRepository.save(member);
        logActivity(projectId, currentUserEmail, "MEMBER_UPDATED", "Updated member", member.getMemberEmail() + " as " + member.getRole());
        return getMembers(projectId);
    }

    public List<ProjectMemberResponse> deleteMember(Long projectId, Long memberId, String currentUserEmail) {
        ProjectMember member = memberRepository.findById(memberId).orElseThrow();
        if (!projectId.equals(member.getProjectId())) {
            throw new IllegalArgumentException("Member does not belong to this project");
        }
        requireProjectAdmin(projectId, currentUserEmail);
        Project project = getById(projectId);
        if (project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(member.getMemberEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project owner cannot be removed");
        }

        String email = member.getMemberEmail();
        memberRepository.delete(member);
        logActivity(projectId, currentUserEmail, "MEMBER_REMOVED", "Removed member", email);
        return getMembers(projectId);
    }

    public ProjectInsightResponse getInsight(Long projectId) {
        ProjectSummaryResponse summary = getSummary(projectId);
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
        List<ChatMessage> messages = chatMessageRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
        int openTasks = (int) (summary.getTodoCount() + summary.getInProgressCount() + summary.getReviewCount());
        double completionRate = summary.getCompletionRate();
        long overdue = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != null && !"DONE".equals(task.getStatus()))
                .filter(task -> task.getDueDate().isBefore(LocalDate.now()))
                .count();
        long dueSoon = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != null && !"DONE".equals(task.getStatus()))
                .filter(task -> !task.getDueDate().isBefore(LocalDate.now()))
                .filter(task -> !task.getDueDate().isAfter(LocalDate.now().plusDays(3)))
                .count();
        long pendingReview = tasks.stream()
                .filter(task -> "REVIEW".equals(task.getStatus()) || "PENDING_REVIEW".equals(task.getSubmissionStatus()))
                .count();

        ProjectInsightResponse aiResponse = projectAiService.analyzeProject(
                summary.getProjectName(),
                summary.getMemberCount(),
                summary.getTaskCount(),
                openTasks,
                completionRate,
                (int) overdue,
                (int) dueSoon,
                (int) pendingReview,
                messages.size()
        );

        return ProjectInsightResponse.builder()
                .projectId(projectId)
                .summary(aiResponse.getSummary())
                .health(aiResponse.getHealth())
                .focus(aiResponse.getFocus())
                .nextAction(aiResponse.getNextAction())
                .context(aiResponse.getContext())
                .highlights(aiResponse.getHighlights())
                .recommendations(aiResponse.getRecommendations())
                .signals(aiResponse.getSignals())
                .build();
    }

    public ProjectAiChatResponse askAiQuestion(Long projectId, String currentUserEmail, String question) {
        requireProjectMember(projectId, currentUserEmail);
        ProjectSummaryResponse summary = getSummary(projectId);
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
        List<ChatMessage> messages = chatMessageRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
        int openTasks = (int) (summary.getTodoCount() + summary.getInProgressCount() + summary.getReviewCount());
        double completionRate = summary.getCompletionRate();
        long overdue = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != null && !"DONE".equals(task.getStatus()))
                .filter(task -> task.getDueDate().isBefore(LocalDate.now()))
                .count();
        long dueSoon = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != null && !"DONE".equals(task.getStatus()))
                .filter(task -> !task.getDueDate().isBefore(LocalDate.now()))
                .filter(task -> !task.getDueDate().isAfter(LocalDate.now().plusDays(3)))
                .count();
        long pendingReview = tasks.stream()
                .filter(task -> "REVIEW".equals(task.getStatus()) || "PENDING_REVIEW".equals(task.getSubmissionStatus()))
                .count();

        return projectAiService.answerProjectQuestion(
                summary.getProjectName(),
                summary.getMemberCount(),
                summary.getTaskCount(),
                openTasks,
                completionRate,
                (int) overdue,
                (int) dueSoon,
                (int) pendingReview,
                messages.size(),
                question
        );
    }

    public ProjectInsightResponse getInsight(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        return getInsight(projectId);
    }

    private void ensureMember(Long projectId, String email, String role) {
        if (email == null || email.isBlank()) {
            return;
        }

        memberRepository.findByProjectIdAndMemberEmail(projectId, email).orElseGet(() ->
                memberRepository.save(
                        ProjectMember.builder()
                                .projectId(projectId)
                                .memberEmail(email)
                                .role(role)
                                .build()
                )
        );
    }

    private String resolveName(String email) {
        if (email == null || email.isBlank()) {
            return "Unassigned";
        }

        return userRepository.findByEmail(email)
                .map(User::getFullName)
                .filter(name -> name != null && !name.isBlank())
                .orElse(email);
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "MEMBER";
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        if ("LEAD".equals(normalized) || "REVIEWER".equals(normalized)) {
            return "MANAGER";
        }
        if (!PROJECT_ROLES.contains(normalized)) {
            return "MEMBER";
        }
        return normalized;
    }

    private String resolveProjectRole(Long projectId, String email) {
        if (email == null || email.isBlank()) {
            return "VIEWER";
        }
        Project project = getById(projectId);
        if (project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(email)) {
            return "OWNER";
        }
        return memberRepository.findByProjectIdAndMemberEmail(projectId, email)
                .map(ProjectMember::getRole)
                .map(this::normalizeRole)
                .orElse("VIEWER");
    }

    private void logActivity(Long projectId, String actorEmail, String type, String title, String detail) {
        activityRepository.save(ProjectActivity.builder()
                .projectId(projectId)
                .actorEmail(actorEmail)
                .actorName(resolveName(actorEmail))
                .type(type)
                .title(title)
                .detail(defaultIfBlank(detail, ""))
                .build());
    }

    private TaskResponse toTaskResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .projectId(task.getProjectId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .assigneeEmail(task.getAssigneeEmail())
                .assigneeName(resolveName(task.getAssigneeEmail()))
                .dueDate(task.getDueDate())
                .requiredFileTypes(task.getRequiredFileTypes())
                .submissionStatus(defaultIfBlank(task.getSubmissionStatus(), "NOT_SUBMITTED"))
                .submissionNote(task.getSubmissionNote())
                .submissionOriginalName(task.getSubmissionOriginalName())
                .submissionContentType(task.getSubmissionContentType())
                .submissionSize(task.getSubmissionSize())
                .submittedByEmail(task.getSubmittedByEmail())
                .submittedByName(resolveName(task.getSubmittedByEmail()))
                .submittedAt(task.getSubmittedAt())
                .reviewedByEmail(task.getReviewedByEmail())
                .reviewedByName(resolveName(task.getReviewedByEmail()))
                .reviewedAt(task.getReviewedAt())
                .reviewNote(task.getReviewNote())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private TaskSubmissionResponse toTaskSubmissionResponse(TaskSubmission submission) {
        return TaskSubmissionResponse.builder()
                .id(submission.getId())
                .projectId(submission.getProjectId())
                .taskId(submission.getTaskId())
                .originalName(submission.getOriginalName())
                .contentType(submission.getContentType())
                .size(submission.getSize())
                .note(submission.getNote())
                .status(defaultIfBlank(submission.getStatus(), "PENDING_REVIEW"))
                .submittedByEmail(submission.getSubmittedByEmail())
                .submittedByName(resolveName(submission.getSubmittedByEmail()))
                .submittedAt(submission.getSubmittedAt())
                .reviewedByEmail(submission.getReviewedByEmail())
                .reviewedByName(resolveName(submission.getReviewedByEmail()))
                .reviewedAt(submission.getReviewedAt())
                .reviewNote(submission.getReviewNote())
                .build();
    }

    private TaskSubmissionResponse toTaskSubmissionResponse(Task task) {
        return TaskSubmissionResponse.builder()
                .id(task.getId())
                .projectId(task.getProjectId())
                .taskId(task.getId())
                .originalName(task.getSubmissionOriginalName())
                .contentType(task.getSubmissionContentType())
                .size(task.getSubmissionSize())
                .note(task.getSubmissionNote())
                .status(defaultIfBlank(task.getSubmissionStatus(), "PENDING_REVIEW"))
                .submittedByEmail(task.getSubmittedByEmail())
                .submittedByName(resolveName(task.getSubmittedByEmail()))
                .submittedAt(task.getSubmittedAt())
                .reviewedByEmail(task.getReviewedByEmail())
                .reviewedByName(resolveName(task.getReviewedByEmail()))
                .reviewedAt(task.getReviewedAt())
                .reviewNote(task.getReviewNote())
                .build();
    }

    private ProjectActivityResponse toActivityResponse(ProjectActivity activity) {
        return ProjectActivityResponse.builder()
                .id(activity.getId())
                .projectId(activity.getProjectId())
                .actorEmail(activity.getActorEmail())
                .actorName(activity.getActorName())
                .type(activity.getType())
                .title(activity.getTitle())
                .detail(activity.getDetail())
                .createdAt(activity.getCreatedAt())
                .build();
    }

    private ProjectAnnouncementResponse toAnnouncementResponse(ProjectAnnouncement announcement) {
        return ProjectAnnouncementResponse.builder()
                .id(announcement.getId())
                .projectId(announcement.getProjectId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .createdByEmail(announcement.getCreatedByEmail())
                .createdByName(announcement.getCreatedByName())
                .createdAt(announcement.getCreatedAt())
                .build();
    }

    private ChatMessageResponse toChatResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .projectId(message.getProjectId())
                .senderEmail(message.getSenderEmail())
                .senderName(message.getSenderName())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private long countStatus(List<Task> tasks, String status) {
        return tasks.stream().filter(task -> status.equals(task.getStatus())).count();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "TODO";
        }
        return status.toUpperCase(Locale.ROOT);
    }

    private String normalizePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return "MEDIUM";
        }
        return priority.toUpperCase(Locale.ROOT);
    }

    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String defaultStatus(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String normalizeFileTypes(String fileTypes) {
        if (fileTypes == null || fileTypes.isBlank()) {
            return "";
        }

        return Arrays.stream(fileTypes.split("[,\\s]+"))
                .map(type -> type.replace(".", "").trim().toLowerCase(Locale.ROOT))
                .filter(type -> !type.isBlank())
                .filter(ALLOWED_SUBMISSION_EXTENSIONS::contains)
                .distinct()
                .reduce((left, right) -> left + "," + right)
                .orElse("");
    }

    private String getExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private void validateSubmissionExtension(Task task, String extension) {
        if (!ALLOWED_SUBMISSION_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File type is not allowed");
        }

        Set<String> requiredTypes = Arrays.stream(defaultIfBlank(task.getRequiredFileTypes(), "").split(","))
                .map(type -> type.trim().toLowerCase(Locale.ROOT))
                .filter(type -> !type.isBlank())
                .collect(java.util.stream.Collectors.toSet());

        if (!requiredTypes.isEmpty() && !requiredTypes.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File type does not match task requirement");
        }
    }

    private String determineHealth(double completionRate, long inProgress, long review) {
        if (completionRate >= 80) {
            return "ON_TRACK";
        }
        if (completionRate >= 50 || inProgress + review > 0) {
            return "WATCH";
        }
        return "FOCUS";
    }

    private String determineFocus(long todo, long inProgress, long review, long done) {
        if (todo > inProgress + review + done) {
            return "Backlog";
        }
        if (review > 0) {
            return "Review";
        }
        if (inProgress > 0) {
            return "Delivery";
        }
        return "Stabilize";
    }

    private String determineNextAction(
            long todo,
            long inProgress,
            long review,
            long done,
            long members,
            long messages
    ) {
        if (todo > inProgress + review + done) {
            return "Break the backlog into one clear owner per task and start delivery.";
        }
        if (review > 0) {
            return "Close review items first so the pipeline can keep moving.";
        }
        if (inProgress > 0) {
            return "Push the current work to review and keep the team aligned in chat.";
        }
        if (members < 2) {
            return "Invite one more teammate before the next delivery cycle.";
        }
        if (messages < 3) {
            return "Start a short sync in chat to create momentum.";
        }
        if (done > 0) {
            return "Add the next task and keep the delivery rhythm steady.";
        }
        return "Define the next task and assign an owner before the sprint starts.";
    }

    private String describeHealth(String health) {
        return switch (health) {
            case "ON_TRACK" -> "On track";
            case "WATCH" -> "Needs attention";
            default -> "Needs focus";
        };
    }

    private String describeFocus(String focus) {
        return switch (focus) {
            case "Backlog" -> "Backlog";
            case "Review" -> "Review";
            case "Delivery" -> "Delivery";
            default -> "Stabilize";
        };
    }

    private void requireProjectMember(Long projectId, String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user");
        }

        Project project = getById(projectId);
        boolean isOwner = project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(email);
        boolean isMember = memberRepository.findByProjectIdAndMemberEmail(projectId, email).isPresent();

        if (!isOwner && !isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this project");
        }
    }

    private void requireOwner(Long projectId, String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user");
        }

        Project project = getById(projectId);
        boolean isOwner = project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(email);
        if (!isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Owner access required");
        }
    }

    private void requireProjectAdmin(Long projectId, String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user");
        }
        String role = resolveProjectRole(projectId, email);
        if (!PROJECT_ADMINS.contains(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Project admin access required");
        }
    }

    private void requireDeliveryManager(Long projectId, String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user");
        }
        String role = resolveProjectRole(projectId, email);
        if (!DELIVERY_MANAGERS.contains(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Task manager access required");
        }
    }

    private void requireNotViewer(Long projectId, String email) {
        String role = resolveProjectRole(projectId, email);
        if ("VIEWER".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Viewer access is read-only");
        }
    }

    private void requireTaskSubmissionPermission(Long projectId, Task task, String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user");
        }

        Project project = getById(projectId);
        boolean isOwner = project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(email);
        boolean canManageDelivery = DELIVERY_MANAGERS.contains(resolveProjectRole(projectId, email));
        boolean isAssignee = task.getAssigneeEmail() != null && task.getAssigneeEmail().equalsIgnoreCase(email);

        if (!isOwner && !canManageDelivery && !isAssignee) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner or assigned member can submit this task");
        }
        requireNotViewer(projectId, email);
    }

    private void requireMessageEditPermission(ChatMessage message, String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user");
        }

        Project project = getById(message.getProjectId());
        boolean isOwner = project.getOwnerEmail() != null && project.getOwnerEmail().equalsIgnoreCase(email);
        boolean isSender = message.getSenderEmail() != null && message.getSenderEmail().equalsIgnoreCase(email);

        if (!isOwner && !isSender) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Message can only be edited by sender or owner");
        }
    }

    private ProjectDashboardProjectResponse toDashboardProjectResponse(Project project, String email) {
        ProjectSummaryResponse summary = getSummary(project.getId());
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtAsc(project.getId());
        List<ChatMessage> messages = chatMessageRepository.findByProjectIdOrderByCreatedAtAsc(project.getId());
        String health = determineHealth(summary.getCompletionRate(), summary.getInProgressCount(), summary.getReviewCount());
        String focus = determineFocus(
                summary.getTodoCount(),
                summary.getInProgressCount(),
                summary.getReviewCount(),
                summary.getDoneCount()
        );
        String nextAction = determineNextAction(
                summary.getTodoCount(),
                summary.getInProgressCount(),
                summary.getReviewCount(),
                summary.getDoneCount(),
                summary.getMemberCount(),
                summary.getMessageCount()
        );
        String role = resolveProjectRole(project.getId(), email);

        return ProjectDashboardProjectResponse.builder()
                .id(project.getId())
                .projectName(project.getProjectName())
                .ownerEmail(project.getOwnerEmail())
                .inviteCode(project.getInviteCode())
                .status(project.getStatus())
                .role(role)
                .owner(PROJECT_ADMINS.contains(role))
                .memberCount(summary.getMemberCount())
                .taskCount(summary.getTaskCount())
                .messageCount(summary.getMessageCount())
                .todoCount(summary.getTodoCount())
                .inProgressCount(summary.getInProgressCount())
                .reviewCount(summary.getReviewCount())
                .doneCount(summary.getDoneCount())
                .completionRate(summary.getCompletionRate())
                .health(health)
                .focus(focus)
                .healthLabel(describeHealth(health))
                .focusLabel(describeFocus(focus))
                .nextAction(nextAction)
                .latestActivity(latestActivity(messages, tasks))
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private String latestActivity(List<ChatMessage> messages, List<Task> tasks) {
        LocalDateTime latestMessage = messages.isEmpty() ? null : messages.get(messages.size() - 1).getCreatedAt();
        LocalDateTime latestTask = tasks.isEmpty() ? null : tasks.get(tasks.size() - 1).getUpdatedAt();

        if (latestMessage == null && latestTask == null) {
            return "No recent activity";
        }

        if (latestMessage != null && (latestTask == null || latestMessage.isAfter(latestTask))) {
            return "Chat message from " + messages.get(messages.size() - 1).getSenderName();
        }

        return "Task updated: " + tasks.get(tasks.size() - 1).getTitle();
    }

    public ResponseEntity<Resource> previewTaskSubmission(Long projectId, Long taskId, String currentUserEmail) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId).orElseThrow();
        requireProjectMember(projectId, currentUserEmail);
        return buildInlineFileResponse(
                task.getSubmissionPath(),
                task.getSubmissionOriginalName(),
                task.getSubmissionContentType()
        );
    }

    public ResponseEntity<Resource> previewSubmissionVersion(
            Long projectId,
            Long taskId,
            Long submissionId,
            String currentUserEmail
    ) {
        requireProjectMember(projectId, currentUserEmail);
        TaskSubmission submission = taskSubmissionRepository.findById(submissionId).orElseThrow();
        if (!projectId.equals(submission.getProjectId()) || !taskId.equals(submission.getTaskId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submission does not belong to this task");
        }
        return buildInlineFileResponse(submission.getPath(), submission.getOriginalName(), submission.getContentType());
    }

    public List<SubmissionCommentResponse> getSubmissionComments(
            Long projectId,
            Long submissionId,
            String currentUserEmail
    ) {
        TaskSubmission submission = taskSubmissionRepository.findById(submissionId).orElseThrow();
        if (!projectId.equals(submission.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submission does not belong to this project");
        }
        requireProjectMember(projectId, currentUserEmail);
        return submissionCommentRepository.findBySubmissionIdOrderByCreatedAtAsc(submissionId).stream()
                .map(this::toSubmissionCommentResponse)
                .toList();
    }

    public SubmissionCommentResponse addSubmissionComment(
            Long projectId,
            Long submissionId,
            SubmissionCommentCreateRequest request,
            String currentUserEmail
    ) {
        TaskSubmission submission = taskSubmissionRepository.findById(submissionId).orElseThrow();
        if (!projectId.equals(submission.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submission does not belong to this project");
        }
        requireProjectMember(projectId, currentUserEmail);

        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment content is required");
        }

        List<String> mentionedEmails = extractMentionedEmails(projectId, request.getContent());
        SubmissionComment saved = submissionCommentRepository.save(SubmissionComment.builder()
                .projectId(projectId)
                .submissionId(submissionId)
                .taskId(submission.getTaskId())
                .content(request.getContent().trim())
                .authorEmail(currentUserEmail)
                .mentionedEmails(String.join(",", mentionedEmails))
                .build());

        logActivity(projectId, currentUserEmail, "COMMENT_ADDED", "Commented on submission", submission.getOriginalName());
        if (systemSettingsService.getSettings().isReviewNotifications()) {
            notificationService.notifyProject(projectId, "COMMENT_ADDED", Map.of(
                    "submissionId", submissionId,
                    "taskId", submission.getTaskId(),
                    "commentId", saved.getId(),
                    "authorEmail", currentUserEmail,
                    "mentionedEmails", mentionedEmails
            ));
        }

        return toSubmissionCommentResponse(saved);
    }

    public List<TaskTemplateResponse> getTaskTemplates(Long projectId, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        return taskTemplateRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::toTaskTemplateResponse)
                .toList();
    }

    public TaskTemplateResponse createTaskTemplate(
            Long projectId,
            TaskTemplateCreateRequest request,
            String currentUserEmail
    ) {
        requireDeliveryManager(projectId, currentUserEmail);
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Template title is required");
        }

        TaskTemplate saved = taskTemplateRepository.save(TaskTemplate.builder()
                .projectId(projectId)
                .title(request.getTitle().trim())
                .description(defaultIfBlank(request.getDescription(), ""))
                .priority(normalizePriority(request.getPriority()))
                .requiredFileTypes(normalizeFileTypes(request.getRequiredFileTypes()))
                .defaultDueDays(request.getDefaultDueDays() == null ? 7 : Math.max(1, request.getDefaultDueDays()))
                .createdByEmail(currentUserEmail)
                .build());

        logActivity(projectId, currentUserEmail, "TEMPLATE_CREATED", "Created task template", saved.getTitle());
        return toTaskTemplateResponse(saved);
    }

    public void deleteTaskTemplate(Long projectId, Long templateId, String currentUserEmail) {
        requireDeliveryManager(projectId, currentUserEmail);
        TaskTemplate template = taskTemplateRepository.findById(templateId).orElseThrow();
        if (!projectId.equals(template.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Template does not belong to this project");
        }
        taskTemplateRepository.delete(template);
        logActivity(projectId, currentUserEmail, "TEMPLATE_DELETED", "Deleted task template", template.getTitle());
    }

    public TaskResponse cloneTaskTemplate(
            Long projectId,
            Long templateId,
            String currentUserEmail
    ) {
        requireDeliveryManager(projectId, currentUserEmail);
        TaskTemplate template = taskTemplateRepository.findById(templateId).orElseThrow();
        if (!projectId.equals(template.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Template does not belong to this project");
        }

        LocalDate dueDate = LocalDate.now().plusDays(template.getDefaultDueDays() == null ? 7 : template.getDefaultDueDays());
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle(template.getTitle());
        request.setDescription(template.getDescription());
        request.setStatus("TODO");
        request.setPriority(template.getPriority());
        request.setAssigneeEmail(currentUserEmail);
        request.setDueDate(dueDate);
        request.setRequiredFileTypes(template.getRequiredFileTypes());
        return createTask(projectId, request, currentUserEmail);
    }

    public List<ProjectSearchItemResponse> searchProject(Long projectId, String query, String currentUserEmail) {
        requireProjectMember(projectId, currentUserEmail);
        String keyword = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        if (keyword.isBlank()) {
            return List.of();
        }

        List<ProjectSearchItemResponse> results = new ArrayList<>();

        taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId).stream()
                .filter(task -> containsKeyword(keyword, task.getTitle(), task.getDescription(), task.getAssigneeEmail()))
                .limit(8)
                .forEach(task -> results.add(ProjectSearchItemResponse.builder()
                        .type("TASK")
                        .id(task.getId())
                        .taskId(task.getId())
                        .title(task.getTitle())
                        .subtitle(defaultIfBlank(task.getAssigneeEmail(), "Unassigned"))
                        .path("/tasks")
                        .build()));

        taskSubmissionRepository.findByProjectIdOrderBySubmittedAtDesc(projectId).stream()
                .filter(submission -> containsKeyword(keyword, submission.getOriginalName(), submission.getNote(), submission.getSubmittedByEmail()))
                .limit(8)
                .forEach(submission -> results.add(ProjectSearchItemResponse.builder()
                        .type("FILE")
                        .id(submission.getId())
                        .taskId(submission.getTaskId())
                        .title(submission.getOriginalName())
                        .subtitle(defaultIfBlank(submission.getSubmittedByEmail(), ""))
                        .path("/files")
                        .build()));

        chatMessageRepository.findByProjectIdOrderByCreatedAtAsc(projectId).stream()
                .filter(message -> containsKeyword(keyword, message.getContent(), message.getSenderEmail(), message.getSenderName()))
                .limit(8)
                .forEach(message -> results.add(ProjectSearchItemResponse.builder()
                        .type("CHAT")
                        .id(message.getId())
                        .title(truncate(message.getContent(), 80))
                        .subtitle(defaultIfBlank(message.getSenderName(), message.getSenderEmail()))
                        .path("/chat")
                        .build()));

        memberRepository.findByProjectId(projectId).stream()
                .filter(member -> containsKeyword(keyword, member.getMemberEmail(), member.getRole()))
                .limit(8)
                .forEach(member -> results.add(ProjectSearchItemResponse.builder()
                        .type("MEMBER")
                        .id(member.getId())
                        .title(member.getMemberEmail())
                        .subtitle(defaultIfBlank(member.getRole(), "MEMBER"))
                        .path("/members")
                        .build()));

        return results.stream().limit(20).toList();
    }

    private ResponseEntity<Resource> buildInlineFileResponse(String path, String originalName, String contentType) {
        if (path == null || path.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }

        try {
            Path filePath = Paths.get(path).toAbsolutePath().normalize();
            if ("docx".equals(getExtension(originalName))) {
                return buildDocxPreviewResponse(filePath, originalName);
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }

            String downloadName = safeResponseFileName(originalName == null ? "file" : originalName);
            MediaType mediaType = resolvePreviewMediaType(downloadName, contentType);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header("X-Content-Type-Options", "nosniff")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + downloadName + "\"")
                    .body(resource);
        } catch (MalformedURLException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
    }

    private ResponseEntity<Resource> buildDocxPreviewResponse(Path filePath, String originalName) {
        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }

        try (InputStream input = Files.newInputStream(filePath);
             XWPFDocument document = new XWPFDocument(input)) {
            StringBuilder body = new StringBuilder();

            for (IBodyElement element : document.getBodyElements()) {
                if (element.getElementType() == BodyElementType.PARAGRAPH) {
                    appendDocxParagraph(body, (XWPFParagraph) element);
                } else if (element.getElementType() == BodyElementType.TABLE) {
                    appendDocxTable(body, (XWPFTable) element);
                }
            }

            String html = """
                    <!doctype html>
                    <html lang="vi">
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                            * { box-sizing: border-box; }
                            body { margin: 0; background: #eef2f7; color: #172033; font: 15px/1.65 Arial, sans-serif; }
                            main { width: min(820px, calc(100%% - 32px)); min-height: calc(100vh - 32px); margin: 16px auto; padding: 48px 56px; background: white; box-shadow: 0 8px 30px rgba(15, 23, 42, .12); }
                            h1, h2, h3 { margin: 1.2em 0 .5em; line-height: 1.3; }
                            p { margin: 0 0 .75em; white-space: pre-wrap; }
                            .list { padding-left: 18px; }
                            table { width: 100%%; margin: 18px 0; border-collapse: collapse; }
                            td { padding: 8px 10px; border: 1px solid #cbd5e1; vertical-align: top; }
                            @media (max-width: 640px) { main { width: 100%%; margin: 0; padding: 24px 20px; box-shadow: none; } }
                        </style>
                        <title>%s</title>
                    </head>
                    <body><main>%s</main></body>
                    </html>
                    """.formatted(escapeHtml(originalName == null ? "Document" : originalName), body);

            Resource resource = new ByteArrayResource(html.getBytes(StandardCharsets.UTF_8));
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"preview.html\"")
                    .body(resource);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not preview DOCX file");
        }
    }

    private void appendDocxParagraph(StringBuilder html, XWPFParagraph paragraph) {
        String text = paragraph.getText();
        if (text == null || text.isBlank()) {
            html.append("<p>&nbsp;</p>");
            return;
        }

        String style = paragraph.getStyle() == null ? "" : paragraph.getStyle().toLowerCase(Locale.ROOT);
        String tag = style.contains("heading1") || style.contains("title")
                ? "h1"
                : style.contains("heading2")
                        ? "h2"
                        : style.contains("heading3") ? "h3" : "p";
        String cssClass = paragraph.getNumID() == null ? "" : " class=\"list\"";
        String prefix = paragraph.getNumID() == null ? "" : "• ";
        html.append("<").append(tag).append(cssClass).append(">")
                .append(prefix)
                .append(escapeHtml(text))
                .append("</").append(tag).append(">");
    }

    private void appendDocxTable(StringBuilder html, XWPFTable table) {
        html.append("<table>");
        for (XWPFTableRow row : table.getRows()) {
            html.append("<tr>");
            for (XWPFTableCell cell : row.getTableCells()) {
                html.append("<td>").append(escapeHtml(cell.getText())).append("</td>");
            }
            html.append("</tr>");
        }
        html.append("</table>");
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private MediaType resolvePreviewMediaType(String fileName, String contentType) {
        String extension = getExtension(fileName);
        return switch (extension) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            case "gif" -> MediaType.IMAGE_GIF;
            case "webp" -> MediaType.parseMediaType("image/webp");
            case "ppt", "pptx" -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }

    private void validateSubmissionContent(MultipartFile file, String extension) {
        try (InputStream input = file.getInputStream()) {
            byte[] header = input.readNBytes(8);
            boolean valid = switch (extension) {
                case "pdf" -> startsWith(header, "%PDF-".getBytes(StandardCharsets.US_ASCII));
                case "jpg", "jpeg", "png", "gif" -> isReadableImage(file);
                case "pptx", "docx", "xlsx", "zip" -> startsWith(header, new byte[]{0x50, 0x4B});
                case "ppt", "doc", "xls" -> startsWith(header, new byte[]{
                        (byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0
                });
                case "rar" -> startsWith(header, new byte[]{0x52, 0x61, 0x72, 0x21});
                default -> false;
            };
            if (!valid) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File content does not match its extension");
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not validate submission file");
        }
    }

    private boolean startsWith(byte[] value, byte[] prefix) {
        if (value.length < prefix.length) return false;
        for (int index = 0; index < prefix.length; index++) {
            if (value[index] != prefix[index]) return false;
        }
        return true;
    }

    private String trustedContentType(String extension) {
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "doc", "xls", "ppt" -> "application/x-ole-storage";
            case "zip" -> "application/zip";
            case "rar" -> "application/vnd.rar";
            default -> "application/octet-stream";
        };
    }

    private boolean isReadableImage(MultipartFile file) throws IOException {
        try (InputStream imageInput = file.getInputStream()) {
            return ImageIO.read(imageInput) != null;
        }
    }

    private String safeResponseFileName(String value) {
        return value.replaceAll("[\\r\\n\\\"]", "_");
    }

    private void deleteTaskSubmissionData(Long projectId, Long taskId, String currentPath) {
        Set<String> paths = new LinkedHashSet<>();
        if (currentPath != null && !currentPath.isBlank()) paths.add(currentPath);
        taskSubmissionRepository.findByProjectIdAndTaskIdOrderBySubmittedAtDesc(projectId, taskId)
                .forEach(submission -> {
                    submissionCommentRepository.findBySubmissionIdOrderByCreatedAtAsc(submission.getId())
                            .forEach(submissionCommentRepository::delete);
                    if (submission.getPath() != null && !submission.getPath().isBlank()) paths.add(submission.getPath());
                    taskSubmissionRepository.delete(submission);
                });
        paths.forEach(this::deleteStoredFile);
    }

    private void deleteStoredFile(String path) {
        if (path == null || path.isBlank()) return;
        try {
            Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = Paths.get(path).toAbsolutePath().normalize();
            if (filePath.startsWith(uploadRoot)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ignored) {
            // Database cleanup remains authoritative; failed file cleanup can be retried operationally.
        }
    }

    private List<WorkloadAlertResponse> buildWorkloadAlerts(List<Task> tasks) {
        Map<String, List<Task>> grouped = tasks.stream()
                .filter(task -> !"DONE".equals(task.getStatus()))
                .filter(task -> task.getAssigneeEmail() != null && !task.getAssigneeEmail().isBlank())
                .collect(Collectors.groupingBy(task -> task.getAssigneeEmail().toLowerCase(Locale.ROOT), LinkedHashMap::new, Collectors.toList()));

        List<WorkloadAlertResponse> alerts = new ArrayList<>();
        grouped.forEach((email, memberTasks) -> {
            long highPriority = memberTasks.stream()
                    .filter(task -> "HIGH".equalsIgnoreCase(task.getPriority()))
                    .count();
            if (highPriority >= 3) {
                alerts.add(WorkloadAlertResponse.builder()
                        .memberEmail(memberTasks.get(0).getAssigneeEmail())
                        .memberName(resolveName(memberTasks.get(0).getAssigneeEmail()))
                        .highPriorityOpenTasks(highPriority)
                        .totalOpenTasks(memberTasks.size())
                        .level("HIGH")
                        .message("Member has " + highPriority + " high-priority open tasks")
                        .build());
            }
        });
        return alerts;
    }

    private List<String> extractMentionedEmails(Long projectId, String content) {
        Set<String> emails = new LinkedHashSet<>();
        Matcher emailMatcher = Pattern.compile("@[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}").matcher(content);
        while (emailMatcher.find()) {
            emails.add(emailMatcher.group().substring(1).toLowerCase(Locale.ROOT));
        }

        List<ProjectMember> members = memberRepository.findByProjectId(projectId);
        for (ProjectMember member : members) {
            String email = member.getMemberEmail();
            if (email == null) {
                continue;
            }
            String localPart = email.split("@")[0];
            String name = resolveName(email);
            if (content.toLowerCase(Locale.ROOT).contains("@" + localPart.toLowerCase(Locale.ROOT))
                    || (name != null && content.toLowerCase(Locale.ROOT).contains("@" + name.toLowerCase(Locale.ROOT)))) {
                emails.add(email.toLowerCase(Locale.ROOT));
            }
        }

        return emails.stream().toList();
    }

    private SubmissionCommentResponse toSubmissionCommentResponse(SubmissionComment comment) {
        List<String> mentioned = comment.getMentionedEmails() == null || comment.getMentionedEmails().isBlank()
                ? List.of()
                : Arrays.stream(comment.getMentionedEmails().split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();

        return SubmissionCommentResponse.builder()
                .id(comment.getId())
                .submissionId(comment.getSubmissionId())
                .taskId(comment.getTaskId())
                .content(comment.getContent())
                .authorEmail(comment.getAuthorEmail())
                .authorName(resolveName(comment.getAuthorEmail()))
                .mentionedEmails(mentioned)
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private TaskTemplateResponse toTaskTemplateResponse(TaskTemplate template) {
        return TaskTemplateResponse.builder()
                .id(template.getId())
                .projectId(template.getProjectId())
                .title(template.getTitle())
                .description(template.getDescription())
                .priority(template.getPriority())
                .requiredFileTypes(template.getRequiredFileTypes())
                .defaultDueDays(template.getDefaultDueDays())
                .createdByEmail(template.getCreatedByEmail())
                .createdByName(resolveName(template.getCreatedByEmail()))
                .createdAt(template.getCreatedAt())
                .build();
    }

    private boolean containsKeyword(String keyword, String... values) {
        for (String value : values) {
            if (value != null && value.toLowerCase(Locale.ROOT).contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength) + "...";
    }

    private TaskResponse updateTaskAfterSubmission(Task task, String originalName, String storedName, String contentType, long size, String note, String currentUserEmail) {
        task.setSubmissionOriginalName(originalName);
        task.setSubmissionStoredName(storedName);
        task.setSubmissionContentType(contentType);
        task.setSubmissionSize(size);
        task.setSubmissionPath(storedName); // Lưu key của S3
        task.setSubmittedByEmail(currentUserEmail);
        task.setSubmittedAt(LocalDateTime.now());
        task.setSubmissionNote(note);
        task.setSubmissionStatus("PENDING_REVIEW");
        task.setReviewNote(null);
        task.setReviewedAt(null);
        task.setReviewedByEmail(null);
        task.setStatus("REVIEW");

        Task saved = taskRepository.save(task);

        taskSubmissionRepository.save(TaskSubmission.builder()
                .projectId(task.getProjectId())
                .taskId(task.getId())
                .originalName(originalName)
                .storedName(storedName)
                .contentType(contentType)
                .size(size)
                .path(storedName)
                .note(note)
                .status("PENDING_REVIEW")
                .submittedByEmail(currentUserEmail)
                .build());

        logActivity(task.getProjectId(), currentUserEmail, "SUBMISSION_UPLOADED", "Submitted file", saved.getTitle());
        return toTaskResponse(saved);
    }
}
