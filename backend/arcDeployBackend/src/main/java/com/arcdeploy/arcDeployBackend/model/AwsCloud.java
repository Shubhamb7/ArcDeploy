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
public class AwsCloud extends Region{
    protected String acId;
    protected String accessKey;
    protected String secretKey;
    private String projectName;
    private List<Region> regions;
}
