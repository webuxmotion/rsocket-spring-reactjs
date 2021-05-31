package io.stremler.rsocketservice.model;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class MessagePriceRequest {
    private long productId;
    private String message;
}
