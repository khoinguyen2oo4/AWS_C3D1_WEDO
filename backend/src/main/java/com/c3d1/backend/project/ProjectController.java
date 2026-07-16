package com.c3d1.backend.project;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController

@RequestMapping(
        "/api/project"
)

@RequiredArgsConstructor

public class ProjectController {

    private final ProjectService projectService;
    private final ProjectNotificationService notificationService;
    private final ProjectReportService reportService;



    @PostMapping("/create")

    public Project create(
            @RequestBody CreateProjectRequest request,
            Authentication authentication
    ) {

        return projectService.create(
                request.getProjectName(),
                authentication.getName()
        );

    }

    @PostMapping("/join")

    public Long join(
            @RequestBody JoinProjectRequest request,
            Authentication authentication
    ) {
        return projectService.join(
                request.getInviteCode(),
                authentication.getName()
        );

    }

    @GetMapping("/dashboard")
    public List<ProjectDashboardProjectResponse> getDashboard(Authentication authentication) {
        return projectService.getDashboardProjects(authentication.getName());
    }

    @GetMapping("/{id}")
    public ProjectSummaryResponse getProject(@PathVariable Long id, Authentication authentication) {
        return projectService.getSummary(id, authentication.getName());
    }

    @GetMapping("/{id}/members")
    public List<ProjectMemberResponse> getMembers(@PathVariable Long id, Authentication authentication) {
        return projectService.getMembers(id, authentication.getName());
    }

    @GetMapping("/{id}/tasks")
    public List<TaskResponse> getTasks(@PathVariable Long id, Authentication authentication) {
        return projectService.getTasks(id, authentication.getName());
    }

    @GetMapping("/{id}/activity")
    public List<ProjectActivityResponse> getActivity(@PathVariable Long id, Authentication authentication) {
        return projectService.getActivity(id, authentication.getName());
    }

    @PostMapping("/{id}/tasks")
    public TaskResponse createTask(
            @PathVariable Long id,
            @RequestBody TaskCreateRequest request,
            Authentication authentication
    ) {
        return projectService.createTask(id, request, authentication.getName());
    }

    @PutMapping("/{id}/tasks/{taskId}")
    public TaskResponse updateTask(
            @PathVariable Long id,
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequest request,
            Authentication authentication
    ) {
        return projectService.updateTask(id, taskId, request, authentication.getName());
    }

    @DeleteMapping("/{id}/tasks/{taskId}")
    public void deleteTask(
            @PathVariable Long id,
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        projectService.deleteTask(id, taskId, authentication.getName());
    }

    @PostMapping(
            value = "/{id}/tasks/{taskId}/submission",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public TaskResponse submitTaskFile(
            @PathVariable Long id,
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "note", required = false) String note,
            Authentication authentication
    ) {
        return projectService.submitTaskFile(id, taskId, file, note, authentication.getName());
    }

    @PutMapping("/{id}/tasks/{taskId}/submission/review")
    public TaskResponse reviewTaskSubmission(
            @PathVariable Long id,
            @PathVariable Long taskId,
            @RequestBody TaskReviewRequest request,
            Authentication authentication
    ) {
        return projectService.reviewTaskSubmission(id, taskId, request, authentication.getName());
    }

    @GetMapping("/{id}/tasks/{taskId}/submission/download")
    public ResponseEntity<Resource> downloadTaskSubmission(
            @PathVariable Long id,
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        return projectService.downloadTaskSubmission(id, taskId, authentication.getName());
    }

    @GetMapping("/{id}/tasks/{taskId}/submissions")
    public List<TaskSubmissionResponse> getTaskSubmissions(
            @PathVariable Long id,
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        return projectService.getTaskSubmissions(id, taskId, authentication.getName());
    }

    @GetMapping("/{id}/messages")
    public List<ChatMessageResponse> getMessages(@PathVariable Long id, Authentication authentication) {
        return projectService.getMessages(id, authentication.getName());
    }

    @PostMapping("/{id}/messages")
    public ChatMessageResponse sendMessage(
            @PathVariable Long id,
            @RequestBody ChatMessageCreateRequest request,
            Authentication authentication
    ) {
        return projectService.sendMessage(id, authentication.getName(), request.getContent());
    }

    @PutMapping("/{id}/messages/{messageId}")
    public ChatMessageResponse updateMessage(
            @PathVariable Long id,
            @PathVariable Long messageId,
            @RequestBody ChatMessageUpdateRequest request,
            Authentication authentication
    ) {
        return projectService.updateMessage(id, messageId, request.getContent(), authentication.getName());
    }

    @DeleteMapping("/{id}/messages/{messageId}")
    public void deleteMessage(
            @PathVariable Long id,
            @PathVariable Long messageId,
            Authentication authentication
    ) {
        projectService.deleteMessage(id, messageId, authentication.getName());
    }

    @GetMapping("/{id}/announcements")
    public List<ProjectAnnouncementResponse> getAnnouncements(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return projectService.getAnnouncements(id, authentication.getName());
    }

    @PostMapping("/{id}/announcements")
    public ProjectAnnouncementResponse createAnnouncement(
            @PathVariable Long id,
            @RequestBody ProjectAnnouncementRequest request,
            Authentication authentication
    ) {
        return projectService.createAnnouncement(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}/announcements/{announcementId}")
    public void deleteAnnouncement(
            @PathVariable Long id,
            @PathVariable Long announcementId,
            Authentication authentication
    ) {
        projectService.deleteAnnouncement(id, announcementId, authentication.getName());
    }

    @GetMapping("/{id}/performance")
    public ProjectPerformanceResponse getPerformance(@PathVariable Long id, Authentication authentication) {
        return projectService.getPerformance(id, authentication.getName());
    }

    @GetMapping("/{id}/settings")
    public ProjectSettingsResponse getSettings(@PathVariable Long id, Authentication authentication) {
        return projectService.getSettings(id, authentication.getName());
    }

    @PutMapping("/{id}/settings")
    public ProjectSettingsResponse updateSettings(
            @PathVariable Long id,
            @RequestBody ProjectSettingsRequest request,
            Authentication authentication
    ) {
        return projectService.updateSettings(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public void deleteProject(
            @PathVariable Long id,
            Authentication authentication
    ) {
        projectService.deleteProject(id, authentication.getName());
    }

    @PostMapping("/{id}/members")
    public List<ProjectMemberResponse> addMember(
            @PathVariable Long id,
            @RequestBody ProjectMemberUpsertRequest request,
            Authentication authentication
    ) {
        return projectService.addMember(id, request, authentication.getName());
    }

    @PutMapping("/{id}/members/{memberId}")
    public List<ProjectMemberResponse> updateMember(
            @PathVariable Long id,
            @PathVariable Long memberId,
            @RequestBody ProjectMemberUpsertRequest request,
            Authentication authentication
    ) {
        return projectService.updateMember(id, memberId, request, authentication.getName());
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public List<ProjectMemberResponse> deleteMember(
            @PathVariable Long id,
            @PathVariable Long memberId,
            Authentication authentication
    ) {
        return projectService.deleteMember(id, memberId, authentication.getName());
    }

    @GetMapping("/{id}/ai")
    public ProjectInsightResponse getInsight(@PathVariable Long id, Authentication authentication) {
        return projectService.getInsight(id, authentication.getName());
    }

    @PostMapping("/{id}/ai/chat")
    public ProjectAiChatResponse askAiQuestion(
            @PathVariable Long id,
            @RequestBody ProjectAiChatRequest request,
            Authentication authentication
    ) {
        return projectService.askAiQuestion(id, authentication.getName(), request.getQuestion());
    }

    @GetMapping("/{id}/tasks/{taskId}/submission/preview")
    public ResponseEntity<Resource> previewTaskSubmission(
            @PathVariable Long id,
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        return projectService.previewTaskSubmission(id, taskId, authentication.getName());
    }

    @GetMapping("/{id}/tasks/{taskId}/submissions/{submissionId}/preview")
    public ResponseEntity<Resource> previewSubmissionVersion(
            @PathVariable Long id,
            @PathVariable Long taskId,
            @PathVariable Long submissionId,
            Authentication authentication
    ) {
        return projectService.previewSubmissionVersion(id, taskId, submissionId, authentication.getName());
    }

    @GetMapping("/{id}/submissions/{submissionId}/comments")
    public List<SubmissionCommentResponse> getSubmissionComments(
            @PathVariable Long id,
            @PathVariable Long submissionId,
            Authentication authentication
    ) {
        return projectService.getSubmissionComments(id, submissionId, authentication.getName());
    }

    @PostMapping("/{id}/submissions/{submissionId}/comments")
    public SubmissionCommentResponse addSubmissionComment(
            @PathVariable Long id,
            @PathVariable Long submissionId,
            @RequestBody SubmissionCommentCreateRequest request,
            Authentication authentication
    ) {
        return projectService.addSubmissionComment(id, submissionId, request, authentication.getName());
    }

    @GetMapping("/{id}/task-templates")
    public List<TaskTemplateResponse> getTaskTemplates(@PathVariable Long id, Authentication authentication) {
        return projectService.getTaskTemplates(id, authentication.getName());
    }

    @PostMapping("/{id}/task-templates")
    public TaskTemplateResponse createTaskTemplate(
            @PathVariable Long id,
            @RequestBody TaskTemplateCreateRequest request,
            Authentication authentication
    ) {
        return projectService.createTaskTemplate(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}/task-templates/{templateId}")
    public void deleteTaskTemplate(
            @PathVariable Long id,
            @PathVariable Long templateId,
            Authentication authentication
    ) {
        projectService.deleteTaskTemplate(id, templateId, authentication.getName());
    }

    @PostMapping("/{id}/task-templates/{templateId}/clone")
    public TaskResponse cloneTaskTemplate(
            @PathVariable Long id,
            @PathVariable Long templateId,
            Authentication authentication
    ) {
        return projectService.cloneTaskTemplate(id, templateId, authentication.getName());
    }

    @GetMapping("/{id}/search")
    public List<ProjectSearchItemResponse> searchProject(
            @PathVariable Long id,
            @RequestParam("q") String query,
            Authentication authentication
    ) {
        return projectService.searchProject(id, query, authentication.getName());
    }

    @GetMapping("/{id}/notifications/stream")
    public SseEmitter streamNotifications(@PathVariable Long id, Authentication authentication) {
        projectService.getSummary(id, authentication.getName());
        return notificationService.subscribe(id);
    }

    @GetMapping("/{id}/report/weekly")
    public ResponseEntity<byte[]> exportWeeklyReport(
            @PathVariable Long id,
            @RequestParam(value = "format", defaultValue = "excel") String format,
            Authentication authentication
    ) {
        projectService.getSummary(id, authentication.getName());
        return reportService.exportWeeklyReport(id, format);
    }

}
