package com.c3d1.backend.project;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectAiService {

    private final RestTemplateBuilder restTemplateBuilder;
    private final ObjectMapper objectMapper;

    @Value("${c3d1.ai.provider:openai}")
    private String provider;

    @Value("${c3d1.ai.endpoint:}")
    private String endpoint;

    @Value("${c3d1.ai.model:gpt-4o-mini}")
    private String model;

    @Value("${c3d1.ai.max-tokens:400}")
    private int maxTokens;

    public ProjectInsightResponse analyzeProject(String projectName, long memberCount, long totalTasks, int openTasks,
                                                double completionRate, int overdue, int dueSoon, int pendingReview,
                                                int messages) {
        if (!hasConfig()) {
            return buildFallbackInsight(projectName, memberCount, totalTasks, openTasks, completionRate,
                    overdue, dueSoon, pendingReview, messages);
        }

        try {
            String prompt = buildPrompt(projectName, memberCount, totalTasks, openTasks, completionRate,
                    overdue, dueSoon, pendingReview, messages);
            String responseText = callModel(prompt);
            return parseModelResponse(responseText, projectName, memberCount, totalTasks, openTasks, completionRate,
                    overdue, dueSoon, pendingReview, messages);
        } catch (Exception ex) {
            log.warn("AI analysis failed for project {}, falling back to heuristic insight: {}", projectName, ex.getMessage());
            return buildFallbackInsight(projectName, memberCount, totalTasks, openTasks, completionRate,
                    overdue, dueSoon, pendingReview, messages);
        }
    }

    public ProjectAiChatResponse answerProjectQuestion(String projectName, long memberCount, long totalTasks, int openTasks,
                                                       double completionRate, int overdue, int dueSoon, int pendingReview,
                                                       int messages, String question) {
        if (!hasConfig()) {
            return buildFallbackChatResponse(projectName, memberCount, totalTasks, openTasks, completionRate,
                    overdue, dueSoon, pendingReview, messages, question);
        }

        try {
            String prompt = buildChatPrompt(projectName, memberCount, totalTasks, openTasks, completionRate,
                    overdue, dueSoon, pendingReview, messages, question);
            String responseText = callModel(prompt);
            return ProjectAiChatResponse.builder()
                    .answer(responseText)
                    .mode("ai")
                    .build();
        } catch (Exception ex) {
            log.warn("AI chat failed for project {}, falling back to heuristic response: {}", projectName, ex.getMessage());
            return buildFallbackChatResponse(projectName, memberCount, totalTasks, openTasks, completionRate,
                    overdue, dueSoon, pendingReview, messages, question);
        }
    }

    protected ProjectAiChatResponse buildFallbackChatResponse(String projectName, long memberCount, long totalTasks, int openTasks,
                                                              double completionRate, int overdue, int dueSoon,
                                                              int pendingReview, int messages, String question) {
        StringBuilder answer = new StringBuilder();
        answer.append("Dự án ").append(projectName).append(" hiện có ")
                .append(openTasks).append(" công việc đang mở, tỷ lệ hoàn thành là ")
                .append(String.format(Locale.ROOT, "%.1f%%", completionRate)).append(". ");

        if (overdue > 0) {
            answer.append("Có ").append(overdue).append(" công việc quá hạn, cần ưu tiên xử lý ngay. ");
        }
        if (dueSoon > 0) {
            answer.append("Có ").append(dueSoon).append(" việc sắp đến hạn, nên kiểm tra người phụ trách. ");
        }
        if (pendingReview > 0) {
            answer.append("Hiện có ").append(pendingReview).append(" mục đang chờ review. ");
        }
        if (question != null && !question.isBlank()) {
            answer.append("Câu hỏi của bạn: ").append(question).append(". ");
        }
        answer.append("Nếu muốn, tôi có thể gợi ý hành động cụ thể cho từng vai trò Owner, Admin hoặc Member.");

        return ProjectAiChatResponse.builder()
                .answer(answer.toString())
                .mode("fallback")
                .build();
    }

    protected ProjectInsightResponse buildFallbackInsight(String projectName, long memberCount, long totalTasks, int openTasks,
                                                         double completionRate, int overdue, int dueSoon,
                                                         int pendingReview, int messages) {
        String health = completionRate >= 80 ? "ON_TRACK" : completionRate >= 55 ? "WATCH" : "NEEDS_FOCUS";
        String focus = overdue > 0 ? "REVIEW" : dueSoon > 0 ? "DELIVERY" : "BACKLOG";
        String nextAction = overdue > 0
                ? "Ưu tiên các công việc quá hạn và tháo gỡ trở ngại cho nhóm trước buổi review tiếp theo."
                : dueSoon > 0
                    ? "Tập trung vào các việc sắp đến hạn và xác nhận người phụ trách cho khung giao hàng tiếp theo."
                    : "Dùng điểm check-in sprint tiếp theo để phân công công việc có giá trị cao nhất.";

        String summary = String.format(Locale.ROOT,
                "Dự án %s hiện có %d thành viên, %d công việc và %d công việc đang mở. Tỷ lệ hoàn thành là %.1f%%.",
                projectName, memberCount, totalTasks, openTasks, completionRate);

        String context = String.format(Locale.ROOT,
                "Nhóm hiện có %d mục đang hoạt động, %d công việc quá hạn, %d việc sắp đến hạn, %d đang chờ review và %d tin nhắn gần đây.",
                openTasks, overdue, dueSoon, pendingReview, messages);

        List<String> highlights = List.of(
                "Tỷ lệ hoàn thành: " + String.format(Locale.ROOT, "%.1f%%", completionRate),
                "Công việc đang mở: " + openTasks,
                "Đang chờ review: " + pendingReview,
                "Công việc quá hạn: " + overdue
        );

        List<String> recommendations = new ArrayList<>();
        if (overdue > 0) {
            recommendations.add("Tháo gỡ các công việc quá hạn và phân công lại trách nhiệm khi cần thiết.");
        }
        if (pendingReview > 0) {
            recommendations.add("Đẩy các mục đang chờ review về trạng thái hoàn tất để giảm rủi ro giao hàng.");
        }
        if (dueSoon > 0) {
            recommendations.add("Chuẩn bị một check-in ngắn cho các công việc sắp đến hạn.");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("Giữ nhịp độ bằng cách chọn công việc có tác động lớn tiếp theo.");
        }

        List<String> signals = List.of(
                "Sức khỏe: " + describeHealth(health),
                "Tập trung: " + describeFocus(focus),
                "Công việc đang mở: " + openTasks,
                "Hoạt động gần đây: " + Math.max(0, messages)
        );

        return ProjectInsightResponse.builder()
                .summary(summary)
                .health(health)
                .focus(focus)
                .nextAction(nextAction)
                .context(context)
                .highlights(highlights)
                .recommendations(recommendations)
                .signals(signals)
                .build();
    }

    private boolean hasConfig() {
        String apiKey = System.getenv("C3D1_AI_API_KEY");
        return "openai".equalsIgnoreCase(provider) && endpoint != null && !endpoint.isBlank() && apiKey != null && !apiKey.isBlank();
    }

    private String buildChatPrompt(String projectName, long memberCount, long totalTasks, int openTasks, double completionRate,
                                   int overdue, int dueSoon, int pendingReview, int messages, String question) {
        return String.format(Locale.ROOT,
                "Bạn là trợ lý AI cho dự án. Hãy trả lời câu hỏi bằng tiếng Việt, ngắn gọn và thực tế. " +
                        "Dự án: %s. Thành viên: %d. Tổng số công việc: %d. Công việc đang mở: %d. Tỷ lệ hoàn thành: %.1f%%. Quá hạn: %d. Sắp đến hạn: %d. Đang chờ review: %d. Tin nhắn gần đây: %d. " +
                        "Câu hỏi: %s",
                projectName, memberCount, totalTasks, openTasks, completionRate, overdue, dueSoon, pendingReview, messages, question);
    }

    private String buildPrompt(String projectName, long memberCount, long totalTasks, int openTasks, double completionRate,
                               int overdue, int dueSoon, int pendingReview, int messages) {
        return String.format(Locale.ROOT,
                "Bạn là chuyên gia phân tích vận hành dự án. Phân tích dự án này và đưa ra lời khuyên ngắn gọn, thực tế bằng tiếng Việt. " +
                        "Dự án: %s. Thành viên: %d. Tổng số công việc: %d. Công việc đang mở: %d. Tỷ lệ hoàn thành: %.1f%%. Quá hạn: %d. Sắp đến hạn: %d. Đang chờ review: %d. Tin nhắn gần đây: %d. " +
                        "Trả lời dưới dạng JSON với các khóa summary, health, focus, nextAction, context, highlights, recommendations, signals, và toàn bộ nội dung phải bằng tiếng Việt.",
                projectName, memberCount, totalTasks, openTasks, completionRate, overdue, dueSoon, pendingReview, messages);
    }

    private String callModel(String prompt) {
        RestTemplate restTemplate = restTemplateBuilder.build();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(System.getenv("C3D1_AI_API_KEY"));

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", maxTokens
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        JsonNode response = restTemplate.postForObject(endpoint, request, JsonNode.class);
        JsonNode choices = response != null ? response.path("choices") : null;
        if (choices == null || !choices.isArray() || choices.isEmpty()) {
            throw new IllegalStateException("Empty AI response");
        }

        JsonNode message = choices.get(0).path("message");
        return message.path("content").asText();
    }

    private ProjectInsightResponse parseModelResponse(String responseText, String projectName, long memberCount, long totalTasks,
                                                     int openTasks, double completionRate, int overdue, int dueSoon,
                                                     int pendingReview, int messages) throws Exception {
        String cleaned = responseText == null ? "" : responseText.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "");
        }
        JsonNode node = objectMapper.readTree(cleaned);

        return ProjectInsightResponse.builder()
                .summary(node.path("summary").asText(""))
                .health(node.path("health").asText("WATCH"))
                .focus(node.path("focus").asText("Delivery"))
                .nextAction(node.path("nextAction").asText("Keep momentum by assigning the next important task."))
                .context(node.path("context").asText(""))
                .highlights(readStringList(node, "highlights"))
                .recommendations(readStringList(node, "recommendations"))
                .signals(readStringList(node, "signals"))
                .build();
    }

    private List<String> readStringList(JsonNode node, String field) {
        JsonNode values = node.path(field);
        if (values == null || !values.isArray()) {
            return List.of();
        }

        List<String> result = new ArrayList<>();
        for (JsonNode item : values) {
            result.add(item.asText());
        }
        return result;
    }

    private String describeHealth(String health) {
        return switch (health) {
            case "ON_TRACK" -> "Ổn định";
            case "WATCH" -> "Cần chú ý";
            default -> "Cần tập trung";
        };
    }

    private String describeFocus(String focus) {
        return switch (focus) {
            case "BACKLOG" -> "Danh sách chờ";
            case "REVIEW" -> "Đánh giá";
            case "DELIVERY" -> "Giao hàng";
            default -> "Ổn định";
        };
    }
}
