package com.c3d1.backend.project;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
public class ProjectNotificationService {

    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> projectEmitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long projectId) {
        SseEmitter emitter = new SseEmitter(0L);
        String key = String.valueOf(projectId);
        projectEmitters.computeIfAbsent(key, ignored -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable cleanup = () -> removeEmitter(key, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(error -> cleanup.run());

        try {
            emitter.send(SseEmitter.event().name("connected").data("{\"status\":\"ok\"}"));
        } catch (IOException exception) {
            removeEmitter(key, emitter);
        }

        return emitter;
    }

    public void notifyProject(Long projectId, String type, Map<String, Object> data) {
        String key = String.valueOf(projectId);
        CopyOnWriteArrayList<SseEmitter> emitters = projectEmitters.get(key);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("type", type);
        payload.put("data", data);
        payload.put("timestamp", LocalDateTime.now().toString());

        String serialized;
        try {
            serialized = objectMapper.writeValueAsString(payload);
        } catch (IOException exception) {
            return;
        }

        for (SseEmitter emitter : List.copyOf(emitters)) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(serialized));
            } catch (IOException exception) {
                removeEmitter(key, emitter);
            }
        }
    }

    private void removeEmitter(String key, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = projectEmitters.get(key);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                projectEmitters.remove(key, emitters);
            }
        }
        emitter.complete();
    }
}
