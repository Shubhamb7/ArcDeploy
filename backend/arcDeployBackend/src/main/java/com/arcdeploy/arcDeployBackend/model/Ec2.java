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
    protected String name;
    protected String type;
    protected String instanceType;
    protected String operatingSystem;
    protected String operatingSystemVersion;
    protected String keyPair;
    protected String ephemeralStorage;
}
