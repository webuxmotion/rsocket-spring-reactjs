package io.stremler.rsocketservice.model;

import lombok.*;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessagePrice {
    private long id;
    public long price;
}
