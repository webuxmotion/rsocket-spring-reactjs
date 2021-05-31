package io.stremler.rsocketservice.controller;

import io.stremler.rsocketservice.model.Message;
import io.stremler.rsocketservice.model.MessageCatalog;
import io.stremler.rsocketservice.model.MessagePrice;
import io.stremler.rsocketservice.model.MessagePriceRequest;
import io.stremler.rsocketservice.model.MessageImage;
import io.stremler.rsocketservice.model.MessageImageRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Controller
public class RSocketController {

    @MessageMapping("image")
    public Flux<MessageImage> image(final Flux<MessageImageRequest> settings) {
        return settings
                .doOnNext(messageImageRequest -> log.info("Received price request with id " + messageImageRequest.getProductId()))
                .delayElements(Duration.ofMillis(30))
                .doOnCancel(() -> log.warn("The client cancelled the price."))
                .flatMap(message -> Mono.just(new MessageImage(message.getProductId(), "image-" + message.getProductId() + ".jpg")));
    }

    @MessageMapping("price")
    public Flux<MessagePrice> price(final Flux<MessagePriceRequest> settings) {
        return settings
                .doOnNext(messagePriceRequest -> log.info("Received price request with id " + messagePriceRequest.getProductId()))
                .delayElements(Duration.ofMillis(30))
                .doOnCancel(() -> log.warn("The client cancelled the price."))
                .flatMap(message -> Mono.just(new MessagePrice(message.getProductId(), message.getProductId() * 2)));
    }

    @MessageMapping("catalog")
    public Flux<MessageCatalog> stream(final MessageCatalog request) {
        log.info("Received stream request: {}", request);
        return Flux
                .interval(Duration.ofMillis(30))
                .map(index -> new MessageCatalog(request.chunkId * 100 + index, request.chunkId))
                .log();
    }
}
