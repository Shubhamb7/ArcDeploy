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
    private String protocol;
    private String port;
    private String targetId;
}
