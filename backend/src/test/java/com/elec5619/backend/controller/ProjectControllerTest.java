package com.elec5619.backend.controller;

import com.elec5619.backend.config.WebConfig;
import com.elec5619.backend.dto.ProjectCreateDto;
import com.elec5619.backend.dto.ProjectResponseDto;
import com.elec5619.backend.dto.ProjectUpdateDto;
import com.elec5619.backend.entity.ProjectStatus;
import com.elec5619.backend.interceptor.JwtInterceptor;
import com.elec5619.backend.service.ProjectService;
import com.elec5619.backend.util.JwtUtil;
import com.elec5619.backend.util.PermissionChecker;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
 

@WebMvcTest(controllers = ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private WebConfig webConfig;
    @MockBean private JwtInterceptor jwtInterceptor;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private PermissionChecker permissionChecker;
    @MockBean private ProjectService projectService;

    private ProjectResponseDto project;

    @BeforeEach
    void setup() {
        project = new ProjectResponseDto();
        project.setId(1L);
        project.setProjectName("proj");
        project.setStatus(ProjectStatus.ACTIVE);
        // Allow interceptor and permissions to pass
        try {
            when(jwtInterceptor.preHandle(any(), any(), any())).thenReturn(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        doNothing().when(permissionChecker).requireProjectAccess(anyLong(), anyLong(), anyString());
    }

    @Test
    void create_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(projectService.create(any(ProjectCreateDto.class))).thenReturn(project);
        ProjectCreateDto dto = new ProjectCreateDto();
        dto.setProjectName("proj");
        mockMvc.perform(post("/api/projects").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void listAll_ok() throws Exception {
        when(projectService.listAll()).thenReturn(List.of(project));
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void getById_notFound() throws Exception {
        doNothing().when(permissionChecker).requireProjectAccess(anyLong(), anyLong(), anyString());
        when(projectService.getById(9L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/projects/9").requestAttr("userId", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void getByName_ok() throws Exception {
        when(projectService.getByName("proj")).thenReturn(Optional.of(project));
        mockMvc.perform(get("/api/projects/by-name/proj"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void listByStatus_ok() throws Exception {
        when(projectService.listByStatus(ProjectStatus.ACTIVE)).thenReturn(List.of(project));
        mockMvc.perform(get("/api/projects/by-status/ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void update_notFound() throws Exception {
        doNothing().when(permissionChecker).requireProjectAccess(anyLong(), anyLong(), anyString());
        when(projectService.update(eq(1L), any(ProjectUpdateDto.class))).thenReturn(Optional.empty());
        mockMvc.perform(put("/api/projects/1").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ProjectUpdateDto())))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateStatus_notFound() throws Exception {
        when(projectService.updateStatus(1L, ProjectStatus.COMPLETED)).thenReturn(Optional.empty());
        mockMvc.perform(put("/api/projects/1/status/COMPLETED"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateStatus_ok() throws Exception {
        when(projectService.updateStatus(1L, ProjectStatus.COMPLETED)).thenReturn(Optional.of(project));
        mockMvc.perform(put("/api/projects/1/status/COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void delete_ok_or_notFound() throws Exception {
        when(projectService.delete(1L)).thenReturn(true);
        mockMvc.perform(delete("/api/projects/1"))
                .andExpect(status().isOk());

        when(projectService.delete(2L)).thenReturn(false);
        mockMvc.perform(delete("/api/projects/2"))
                .andExpect(status().isNotFound());
    }

    @Test
    void members_add_and_remove_and_get() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(projectService.addMembers(eq(1L), any(Set.class))).thenReturn(Optional.of(project));
        mockMvc.perform(post("/api/projects/1/members").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("[2,3]"))
                .andExpect(status().isOk());

        when(projectService.removeMembers(eq(1L), any(Set.class))).thenReturn(Optional.of(project));
        mockMvc.perform(delete("/api/projects/1/members").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("[2]"))
                .andExpect(status().isOk());

        when(projectService.getProjectMembers(1L)).thenReturn(Optional.of(Set.of(1L, 2L)));
        mockMvc.perform(get("/api/projects/1/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").exists());
    }

    @Test
    void members_add_notFound() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(projectService.addMembers(eq(99L), any(Set.class))).thenReturn(Optional.empty());
        mockMvc.perform(post("/api/projects/99/members").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("[2,3]"))
                .andExpect(status().isNotFound());
    }

    @Test
    void myProjects_branchByRole() throws Exception {
        when(projectService.listAll()).thenReturn(List.of(project));
        when(projectService.getProjectsByUserId(1L)).thenReturn(List.of(project));

        mockMvc.perform(get("/api/projects/my").requestAttr("userId", 1L).requestAttr("userRole", "admin"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/projects/my").requestAttr("userId", 1L).requestAttr("userRole", "operation"))
                .andExpect(status().isOk());
    }
}


