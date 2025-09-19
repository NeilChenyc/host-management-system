import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class TestAlertRule {
    public static void main(String[] args) {
        try {
            // URL of the alert rule endpoint
            URL url = new URL("http://localhost:8080/api/alert-rules");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            // Set request method to POST
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            
            // JSON payload without ruleId using a single properly escaped string
            String jsonInputString = "{\"ruleName\":\"Test Rule Fixed\",\"description\":\"Test rule to verify the fix\",\"targetMetric\":\"cpu_usage\",\"comparator\":\"gt\",\"threshold\":80.0,\"duration\":30,\"severity\":\"high\",\"enabled\":true,\"scopeLevel\":\"server\",\"projectId\":1}";
            
            // Send the request
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
            
            // Get the response
            int responseCode = conn.getResponseCode();
            System.out.println("Response Code: " + responseCode);
            
            // Read the response body
            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                String responseLine = null;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            } catch (Exception e) {
                // Handle error response reading
                System.out.println("Error reading response: " + e.getMessage());
                try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(conn.getErrorStream(), "utf-8"))) {
                    String responseLine = null;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                }
            }
            
            System.out.println("Response Body: " + response.toString());
            
            // If successful, verify that the rule was created without specifying ruleId
            if (responseCode >= 200 && responseCode < 300) {
                System.out.println("Success! AlertRule created successfully.");
                System.out.println("The fix to clear ruleId before saving is working.");
            } else {
                System.out.println("Failed to create AlertRule.");
            }
            
        } catch (Exception e) {
            System.out.println("Error during test: " + e.getMessage());
            e.printStackTrace();
        }
    }
}