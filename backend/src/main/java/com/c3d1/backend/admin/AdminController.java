package com.c3d1.backend.admin;

import com.c3d1.backend.project.ProjectMemberResponse;
import com.c3d1.backend.project.ProjectMemberUpsertRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/summary")
    public AdminSummaryResponse getSummary() {
        return adminService.getSummary();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {
        return adminService.getUsers();
    }

    @PutMapping("/users/{id}")
    public AdminUserResponse updateUser(
            @PathVariable Long id,
            @RequestBody AdminUserUpdateRequest request
    ) {
        return adminService.updateUser(id, request);
    }

    @GetMapping("/projects")
    public List<AdminProjectResponse> getProjects() {
        return adminService.getProjects();
    }

    @PutMapping("/projects/{id}")
    public AdminProjectResponse updateProject(
            @PathVariable Long id,
            @RequestBody AdminProjectUpdateRequest request
    ) {
        return adminService.updateProject(id, request);
    }

    @GetMapping("/projects/{id}/members")
    public List<ProjectMemberResponse> getProjectMembers(@PathVariable Long id) {
        return adminService.getProjectMembers(id);
    }

    @PostMapping("/projects/{id}/members")
    public List<ProjectMemberResponse> addProjectMember(
            @PathVariable Long id,
            @RequestBody ProjectMemberUpsertRequest request
    ) {
        return adminService.addProjectMember(id, request);
    }

    @PutMapping("/projects/{id}/members/{memberId}")
    public List<ProjectMemberResponse> updateProjectMember(
            @PathVariable Long id,
            @PathVariable Long memberId,
            @RequestBody ProjectMemberUpsertRequest request
    ) {
        return adminService.updateProjectMember(id, memberId, request);
    }

    @DeleteMapping("/projects/{id}/members/{memberId}")
    public List<ProjectMemberResponse> deleteProjectMember(
            @PathVariable Long id,
            @PathVariable Long memberId
    ) {
        return adminService.deleteProjectMember(id, memberId);
    }

    @GetMapping("/activity")
    public List<AdminActivityResponse> getActivity() {
        return adminService.getActivity();
    }

    @GetMapping("/system")
    public AdminSystemResponse getSystem() {
        return adminService.getSystem();
    }

    @PutMapping("/system/settings")
    public AdminSystemResponse updateSystemSettings(@RequestBody SystemSettingsRequest request) {
        return adminService.updateSystemSettings(request);
    }

    @PostMapping("/system/storage/cleanup")
    public StorageCleanupResponse cleanStorage() {
        return adminService.cleanStorage();
    }
}
