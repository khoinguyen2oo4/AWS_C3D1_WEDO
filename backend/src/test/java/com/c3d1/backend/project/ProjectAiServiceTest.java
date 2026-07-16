package com.c3d1.backend.project;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectAiServiceTest {

    @Test
    void fallbackInsightShouldContainProjectContextAndActionItems() {
        ProjectAiService service = new ProjectAiService(new RestTemplateBuilder(), new ObjectMapper());

        ProjectInsightResponse response = service.buildFallbackInsight(
                "Alpha",
                3,
                8,
                11,
                62.5,
                2,
                3,
                1,
                2
        );

        assertThat(response.getSummary()).contains("Alpha");
        assertThat(response.getSummary()).contains("Dự án");
        assertThat(response.getHealth()).isNotBlank();
        assertThat(response.getFocus()).isNotBlank();
        assertThat(response.getNextAction()).isNotBlank();
        assertThat(response.getRecommendations()).isNotEmpty();
        assertThat(response.getSignals()).isNotEmpty();
    }

    @Test
    void fallbackChatShouldAnswerProjectQuestionsInVietnamese() {
        ProjectAiService service = new ProjectAiService(new RestTemplateBuilder(), new ObjectMapper());

        ProjectAiChatResponse response = service.answerProjectQuestion(
                "Alpha",
                3,
                8,
                11,
                62.5,
                2,
                3,
                1,
                2,
                "Dự án này có vấn đề gì?"
        );

        assertThat(response.getAnswer()).contains("Alpha");
        assertThat(response.getAnswer()).contains("Dự án");
        assertThat(response.getAnswer()).contains("quá hạn");
    }
}
