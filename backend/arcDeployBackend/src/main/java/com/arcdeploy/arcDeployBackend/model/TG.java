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
public class TG {
    private String name;
    private String tagName;
    private String type;
    private String protocol;
    private String protocolVer;
    private String port;
    private List<Ec2> instances;
}
