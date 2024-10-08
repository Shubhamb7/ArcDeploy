package com.arcdeploy.arcDeployBackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
public class Listener {
    private String listenerId;
    private String protocol;
    private String certArn;
    private String port;
    private String action;
    private String targetId;
    private String redirect;
    private String fixedResponse;
}
