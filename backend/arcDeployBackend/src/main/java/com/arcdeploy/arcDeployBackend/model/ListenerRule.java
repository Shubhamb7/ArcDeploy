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
public class ListenerRule {
    private String listenerId;
    private String condition;
    private String value;
    private String action;
    private String targetIds;
    private String redirect;
    private String responseCode;
}
