package com.nhjasani.HowlEatsAPI.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

import com.nhjasani.HowlEatsAPI.io.OrderItem;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${sendgrid.api-key}") private String apiKey;
    @Value("${sendgrid.from.email}") private String fromEmail;
    @Value("${sendgrid.from.name}")  private String fromName;
    @Value("${sendgrid.template.order-confirm}") private String templateId;

    public void sendOrderConfirmation(String toEmail,
                                      String toName,
                                      String orderId,
                                      double total,
                                      String address,
                                      List<OrderItem> orderedItems) throws IOException {

        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(Locale.US);

        // Render items like: "Paneer Wrap x 1 = $8.50"
        String itemsBlock = orderedItems.stream()
            .map(i -> {
                String name = i.getName() != null ? i.getName() : "Item";
                int qty = i.getQuantity();
                double price = i.getPrice();
                return String.format("%s x %d = %s", name, qty, currencyFormatter.format(price * qty));
            })
            .reduce((a, b) -> a + "\n" + b)
            .orElse("(no items)");

        Mail mail = new Mail();
        mail.setFrom(new Email(fromEmail, fromName));
        mail.setTemplateId(templateId);

        Personalization p = new Personalization();
        p.addTo(new Email(toEmail, toName));
        p.addDynamicTemplateData("to_name", toName);
        p.addDynamicTemplateData("order_id", orderId);
        p.addDynamicTemplateData("order_total", currencyFormatter.format(total));
        p.addDynamicTemplateData("order_items", itemsBlock);
        p.addDynamicTemplateData("address", address);
        mail.addPersonalization(p);

        Request req = new Request();
        req.setMethod(Method.POST);
        req.setEndpoint("mail/send");
        req.setBody(mail.build());

        Response res = new SendGrid(apiKey).api(req);
        if (res.getStatusCode() >= 400) {
            throw new IOException("SendGrid failed: " + res.getStatusCode() + " - " + res.getBody());
        }
        log.info("Order confirmation email queued: {}", res.getStatusCode());
    }
}
