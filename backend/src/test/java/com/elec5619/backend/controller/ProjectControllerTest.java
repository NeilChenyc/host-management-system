package com.elec5619.backend.controller;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.dto.ProjectCreateDto;
import com.elec5619.backend.dto.ProjectResponseDto;
import com.elec5619.backend.dto.ProjectUpdateDto;
import com.elec5619.backend.entity.ProjectStatus;
import com.elec5619.backend.service.ProjectService;
import com.elec5619.backend.util.PermissionChecker;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ProjectController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class})
class ProjectControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean ProjectService projectService;
    @MockBean PermissionChecker permissionChecker;

    @Test
    void create_requiresPermission_andReturnsOk() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(1L), eq(PermissionConstants.PROJECT_WRITE_ALL));
        ProjectResponseDto resp = new ProjectResponseDto();
        resp.setProjectName("p1");
        given(projectService.create(any(ProjectCreateDto.class))).willReturn(resp);
        String body = "{\"projectName\":\"p1\",\"servers\":[1,2],\"duration\":10,\"userIds\":[3,4]}";
        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectName").value("p1"));
    }

    @Test
    void listAll_returnsOk() throws Exception {
        ProjectResponseDto dto = new ProjectResponseDto(); dto.setProjectName("x");
        given(projectService.listAll()).willReturn(List.of(dto));
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectName").value("x"));
    }

    @Test
    void getById_checksPermission_andFound() throws Exception {
        Mockito.doNothing().when(permissionChecker).requireProjectAccess(eq(9L), eq(2L), eq("read"));
        ProjectResponseDto dto = new ProjectResponseDto(); dto.setId(2L); dto.setProjectName("demo");
        given(projectService.getById(2L)).willReturn(Optional.of(dto));
        mockMvc.perform(get("/api/projects/2").requestAttr("userId", 9L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2));
    }

    @Test
    void update_checksPermission_andNotFound() throws Exception {
        Mockito.doNothing().when(permissionChecker).requireProjectAccess(eq(9L), eq(99L), eq("write"));
        given(projectService.update(eq(99L), any(ProjectUpdateDto.class))).willReturn(Optional.empty());
        String body = "{\"projectName\":\"new\"}";
        mockMvc.perform(put("/api/projects/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .requestAttr("userId", 9L))
                .andExpect(status().isNotFound());
    }

    @Test
    void listByStatus_returnsOk() throws Exception {
        given(projectService.listByStatus(ProjectStatus.PLANNED)).willReturn(List.of());
        mockMvc.perform(get("/api/projects/by-status/PLANNED"))
                .andExpect(status().isOk());
    }

    @Test
    void addMembers_requiresPermission_andOkWhenPresent() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(1L), eq(PermissionConstants.PROJECT_WRITE_ALL));
        ProjectResponseDto dto = new ProjectResponseDto(); dto.setId(7L);
        given(projectService.addMembers(eq(7L), any(Set.class))).willReturn(Optional.of(dto));
        String body = "[2,3]";
        mockMvc.perform(post("/api/projects/7/members")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));
    }
}


