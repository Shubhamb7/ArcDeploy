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
public class Alb {
    private String name;
    private String tagName;
    private String type;
    private List<String> subnetIds;
    private List<Listener> listeners;
    private List<ListenerRule> listenerRules;
}
