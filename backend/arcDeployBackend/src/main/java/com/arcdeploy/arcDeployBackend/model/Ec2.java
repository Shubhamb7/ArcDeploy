package com.arcdeploy.arcDeployBackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@ToString
public class Ec2 {
    private String name;
    private String tagName;
    private String type;
    private String instanceType;
    private String operatingSystem;
    private String operatingSystemVersion;
    private String keyPair;
    private String ephemeralStorage;
    private String userData;
}
