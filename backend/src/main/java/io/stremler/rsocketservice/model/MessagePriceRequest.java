package io.stremler.rsocketservice.model;

import lombok.*;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessagePriceRequest {
    public long productId;
}
