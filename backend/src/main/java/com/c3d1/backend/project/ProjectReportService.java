package com.c3d1.backend.project;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProjectReportService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public ResponseEntity<byte[]> exportWeeklyReport(Long projectId, String format) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
        String normalizedFormat = format == null ? "excel" : format.trim().toLowerCase(Locale.ROOT);

        if ("pdf".equals(normalizedFormat)) {
            return buildPdfReport(project, tasks);
        }

        return buildExcelReport(project, tasks);
    }

    private ResponseEntity<byte[]> buildExcelReport(Project project, List<Task> tasks) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Weekly Report");
            int rowIndex = 0;

            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(rowIndex++);
            titleRow.createCell(0).setCellValue("C3D1 Weekly Report - " + project.getProjectName());

            org.apache.poi.ss.usermodel.Row generatedRow = sheet.createRow(rowIndex++);
            generatedRow.createCell(0).setCellValue("Generated: " + LocalDateTime.now());

            rowIndex++;

            org.apache.poi.ss.usermodel.Row header = sheet.createRow(rowIndex++);
            String[] columns = {"Task", "Status", "Priority", "Assignee", "Due Date", "Submission"};
            for (int i = 0; i < columns.length; i++) {
                header.createCell(i).setCellValue(columns[i]);
            }

            for (Task task : tasks) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(defaultValue(task.getTitle()));
                row.createCell(1).setCellValue(defaultValue(task.getStatus()));
                row.createCell(2).setCellValue(defaultValue(task.getPriority()));
                row.createCell(3).setCellValue(defaultValue(task.getAssigneeEmail()));
                row.createCell(4).setCellValue(task.getDueDate() == null ? "" : task.getDueDate().toString());
                row.createCell(5).setCellValue(defaultValue(task.getSubmissionStatus()));
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(output);
            String filename = sanitizeFileName(project.getProjectName()) + "-weekly-report.xlsx";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(output.toByteArray());
        } catch (Exception exception) {
            throw new IllegalStateException("Could not generate Excel report", exception);
        }
    }

    private ResponseEntity<byte[]> buildPdfReport(Project project, List<Task> tasks) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, output);
            document.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            com.lowagie.text.Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph("C3D1 Weekly Report", titleFont));
            document.add(new Paragraph(project.getProjectName(), bodyFont));
            document.add(new Paragraph("Generated: " + LocalDate.now(), bodyFont));
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            addHeader(table, "Task");
            addHeader(table, "Status");
            addHeader(table, "Priority");
            addHeader(table, "Assignee");
            addHeader(table, "Due");
            addHeader(table, "Submission");

            for (Task task : tasks) {
                table.addCell(new PdfPCell(new Phrase(defaultValue(task.getTitle()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(defaultValue(task.getStatus()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(defaultValue(task.getPriority()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(defaultValue(task.getAssigneeEmail()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(task.getDueDate() == null ? "-" : task.getDueDate().toString(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(defaultValue(task.getSubmissionStatus()), bodyFont)));
            }

            document.add(table);
            document.close();

            String filename = sanitizeFileName(project.getProjectName()) + "-weekly-report.pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(output.toByteArray());
        } catch (Exception exception) {
            throw new IllegalStateException("Could not generate PDF report", exception);
        }
    }

    private void addHeader(PdfPTable table, String text) {
        com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        PdfPCell cell = new PdfPCell(new Phrase(text, headerFont));
        cell.setBackgroundColor(new java.awt.Color(230, 230, 230));
        table.addCell(cell);
    }

    private String defaultValue(String value) {
        return value == null ? "" : value;
    }

    private String sanitizeFileName(String value) {
        if (value == null || value.isBlank()) {
            return "project";
        }
        return value.replaceAll("[^a-zA-Z0-9._-]", "-").toLowerCase(Locale.ROOT);
    }
}
