package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stallrental.model.entity.Area;
import org.example.stallrental.model.entity.Booth;
import org.example.stallrental.model.enumType.BoothStatus;
import org.example.stallrental.repository.AreaRepository;
import org.example.stallrental.repository.BoothRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final AreaRepository areaRepository;
    private final BoothRepository boothRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai.provider:nvidia}")
    private String provider;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.base-url:https://integrate.api.nvidia.com/v1}")
    private String baseUrl;

    @Value("${app.ai.model-name:nvidia/nemotron-3-ultra-550b-a55b}")
    private String modelName;

    private String buildSystemContext() {
        List<Area> areas = areaRepository.findAll();
        List<Booth> availableBooths = boothRepository.findAll().stream()
                .filter(b -> b.getStatus() == BoothStatus.AVAILABLE)
                .collect(Collectors.toList());

        StringBuilder context = new StringBuilder();
        context.append("Bạn là Trợ lý AI tư vấn thuê gian hàng tại trung tâm Stall Rental.\n");
        context.append("Nhiệm vụ của bạn là dựa vào dữ liệu thực tế dưới đây để tư vấn chọn khu vực và gợi ý mã gian hàng phù hợp với ngân sách (VND/tháng) và mặt hàng kinh doanh của khách hàng.\n\n");
        
        context.append("=== DANH SÁCH KHU VỰC QUY HOẠCH ===\n");
        for (Area area : areas) {
            context.append(String.format("- %s: %s (Trạng thái: %s)\n", 
                    area.getName(), 
                    area.getDescription() != null ? area.getDescription() : "",
                    Boolean.TRUE.equals(area.getStatus()) ? "Hoạt động" : "Tạm ngưng"));
        }
        context.append("\n");

        context.append("=== DANH SÁCH GIAN HÀNG CÒN TRỐNG (AVAILABLE) ===\n");
        if (availableBooths.isEmpty()) {
            context.append("Hiện tại toàn bộ gian hàng đã được thuê hết. Hãy hướng dẫn khách hàng đăng ký giữ chỗ trước.\n");
        } else {
            for (Booth b : availableBooths) {
                context.append(String.format("- Mã: %s | Tên: %s | Khu vực: %s | Diện tích: %.1f m2 | Giá thuê: %,.0f VND/tháng | Ưu điểm: %s\n",
                        b.getCode(),
                        b.getName(),
                        b.getArea().getName(),
                        b.getSize(),
                        b.getRentPrice(),
                        b.getDescription() != null ? b.getDescription() : "Không có"));
            }
        }
        context.append("\n");

        context.append("=== HƯỚNG DẪN TRẢ LỜI ===\n");
        context.append("1. Trả lời bằng tiếng Việt, lịch sự, chuyên nghiệp, tràn đầy năng lượng.\n");
        context.append("2. Phân tích tài chính (ví dụ: khách nói 'tài chính 10 triệu', hãy so sánh với giá các gian hàng trống trên để chọn cái thích hợp từ 5M - 10M).\n");
        context.append("3. Phân tích ngành hàng (ví dụ: ẩm thực ăn uống thì gợi ý Khu B hoặc D; quần áo/mỹ phẩm thì gợi ý Khu A; công nghệ thì gợi ý Khu C).\n");
        context.append("4. Nếu thiếu thông tin ngân sách hoặc mặt hàng, hãy đặt câu hỏi gợi ý thân thiện để thu thập thêm.\n");
        context.append("5. Sử dụng định dạng Markdown (**in đậm**, *in nghiêng*, danh sách gạch đầu dòng) để câu trả lời rõ ràng, đẹp mắt.\n");
        
        return context.toString();
    }

    public String getAIResponse(String userPrompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "**[Hệ thống]** Trợ lý AI đang chạy ở chế độ mô phỏng vì chưa cấu hình khóa API (`app.ai.api-key`).\n\n👉 Vui lòng cấu hình biến môi trường `AI_API_KEY` để kích hoạt nhé!";
        }

        try {
            String context = buildSystemContext();

            if ("nvidia".equalsIgnoreCase(provider)) {
                // OpenAI / NVIDIA NIM Chat Completions API
                String url = baseUrl + "/chat/completions";

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(apiKey);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", modelName);
                requestBody.put("temperature", 1.0);
                requestBody.put("top_p", 0.95);
                requestBody.put("max_tokens", 16384);
                requestBody.put("reasoning_budget", 16384);
                requestBody.put("chat_template_kwargs", Map.of("enable_thinking", true));

                // Build messages array
                Map<String, String> systemMessage = new HashMap<>();
                systemMessage.put("role", "system");
                systemMessage.put("content", context);

                Map<String, String> userMessage = new HashMap<>();
                userMessage.put("role", "user");
                userMessage.put("content", userPrompt);

                requestBody.put("messages", List.of(systemMessage, userMessage));

                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

                log.info("Sending request to NVIDIA NIM API (Model: {})...", modelName);
                ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, requestEntity, Map.class);

                if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                    Map responseBody = responseEntity.getBody();
                    List choices = (List) responseBody.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map firstChoice = (Map) choices.get(0);
                        Map message = (Map) firstChoice.get("message");
                        if (message != null) {
                            String content = (String) message.get("content");
                            String reasoning = (String) message.get("reasoning_content");
                            if (reasoning != null && !reasoning.trim().isEmpty()) {
                                StringBuilder formatted = new StringBuilder();
                                formatted.append("**[Suy nghĩ]**\n");
                                for (String line : reasoning.split("\n")) {
                                    if (!line.trim().isEmpty()) {
                                        formatted.append("* *").append(line.trim()).append("*\n");
                                    }
                                }
                                formatted.append("\n---\n\n");
                                formatted.append(content);
                                return formatted.toString();
                            }
                            return content;
                        }
                    }
                }
                return "Không nhận được câu trả lời hợp lệ từ NVIDIA NIM API.";
            } else {
                // Gemini API pathway
                boolean isOAuthToken = apiKey.startsWith("AQ.") || apiKey.startsWith("ya29.");
                String url;
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                if (isOAuthToken) {
                    url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent";
                    headers.setBearerAuth(apiKey);
                } else {
                    url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
                }

                Map<String, Object> requestBody = new HashMap<>();
                
                Map<String, Object> userPart = new HashMap<>();
                userPart.put("text", userPrompt);
                
                Map<String, Object> contentObj = new HashMap<>();
                contentObj.put("role", "user");
                contentObj.put("parts", List.of(userPart));
                requestBody.put("contents", List.of(contentObj));

                Map<String, Object> systemPart = new HashMap<>();
                systemPart.put("text", context);
                
                Map<String, Object> systemInstruction = new HashMap<>();
                systemInstruction.put("parts", List.of(systemPart));
                requestBody.put("systemInstruction", systemInstruction);

                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

                log.info("Sending request to Gemini API (Model: {})...", modelName);
                ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, requestEntity, Map.class);

                if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                    Map responseBody = responseEntity.getBody();
                    List candidates = (List) responseBody.get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map firstCandidate = (Map) candidates.get(0);
                        Map content = (Map) firstCandidate.get("content");
                        if (content != null) {
                            List parts = (List) content.get("parts");
                            if (parts != null && !parts.isEmpty()) {
                                Map firstPart = (Map) parts.get(0);
                                return (String) firstPart.get("text");
                            }
                        }
                    }
                }
                return "Không nhận được phản hồi hợp lệ từ Gemini API.";
            }

        } catch (Exception e) {
            log.error("Error communicating with AI Service: ", e);
            return "Lỗi kết nối đến Trợ lý AI: " + e.getMessage() + ". Vui lòng kiểm tra lại cấu hình hoặc kết nối mạng.";
        }
    }

    public SseEmitter streamAIResponse(String userPrompt) {
        SseEmitter emitter = new SseEmitter(180000L); // 3 minutes timeout

        if (apiKey == null || apiKey.trim().isEmpty()) {
            CompletableFuture.runAsync(() -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name("chunk")
                            .data(objectMapper.writeValueAsString(Map.of("content", "**[Hệ thống]** Khóa API chưa được cấu hình."))));
                    emitter.send(SseEmitter.event().name("done").data("[DONE]"));
                    emitter.complete();
                } catch (Exception e) {
                    emitter.completeWithError(e);
                }
            });
            return emitter;
        }

        CompletableFuture.runAsync(() -> {
            try {
                String context = buildSystemContext();

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", modelName);
                requestBody.put("temperature", 1.0);
                requestBody.put("top_p", 0.95);
                requestBody.put("max_tokens", 16384);
                requestBody.put("reasoning_budget", 16384);
                requestBody.put("chat_template_kwargs", Map.of("enable_thinking", true));
                requestBody.put("stream", true);

                Map<String, String> systemMessage = Map.of("role", "system", "content", context);
                Map<String, String> userMessage = Map.of("role", "user", "content", userPrompt);
                requestBody.put("messages", List.of(systemMessage, userMessage));

                String jsonBody = objectMapper.writeValueAsString(requestBody);

                HttpClient client = HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(10))
                        .build();

                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(baseUrl + "/chat/completions"))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + apiKey)
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                        .build();

                log.info("Sending streaming request to NVIDIA NIM API (Model: {})...", modelName);
                HttpResponse<Stream<String>> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofLines());

                if (response.statusCode() != 200) {
                    emitter.send(SseEmitter.event()
                            .name("chunk")
                            .data(objectMapper.writeValueAsString(Map.of("content", "**[Hệ thống]** Không thể kết nối với AI Service (HTTP " + response.statusCode() + ")."))));
                    emitter.send(SseEmitter.event().name("done").data("[DONE]"));
                    emitter.complete();
                    return;
                }

                try (Stream<String> lines = response.body()) {
                    lines.forEach(line -> {
                        try {
                            if (line == null || line.trim().isEmpty()) {
                                return;
                            }
                            String trimmed = line.trim();
                            if (trimmed.startsWith("data: ")) {
                                String dataStr = trimmed.substring(6).trim();
                                if ("[DONE]".equals(dataStr)) {
                                    emitter.send(SseEmitter.event().name("done").data("[DONE]"));
                                    return;
                                }

                                JsonNode node = objectMapper.readTree(dataStr);
                                JsonNode choices = node.get("choices");
                                if (choices != null && choices.isArray() && choices.size() > 0) {
                                    JsonNode delta = choices.get(0).get("delta");
                                    if (delta != null) {
                                        String reasoning = delta.has("reasoning_content") ? delta.get("reasoning_content").asText() : null;
                                        String content = delta.has("content") ? delta.get("content").asText() : null;

                                        Map<String, String> chunkMap = new HashMap<>();
                                        if (reasoning != null && !reasoning.isEmpty()) chunkMap.put("reasoning", reasoning);
                                        if (content != null && !content.isEmpty()) chunkMap.put("content", content);

                                        if (!chunkMap.isEmpty()) {
                                            emitter.send(SseEmitter.event()
                                                    .name("chunk")
                                                    .data(objectMapper.writeValueAsString(chunkMap)));
                                        }
                                    }
                                }
                            }
                        } catch (IOException e) {
                            log.warn("Client disconnected or error parsing chunk: {}", e.getMessage());
                        }
                    });
                }

                emitter.complete();
            } catch (Exception e) {
                log.error("Error streaming AI response", e);
                try {
                    emitter.send(SseEmitter.event()
                            .name("chunk")
                            .data(objectMapper.writeValueAsString(Map.of("content", "**[Lỗi hệ thống]** Đã xảy ra lỗi: " + e.getMessage()))));
                    emitter.send(SseEmitter.event().name("done").data("[DONE]"));
                } catch (Exception ex) {
                    // Ignore
                }
                emitter.complete();
            }
        });

        return emitter;
    }
}
