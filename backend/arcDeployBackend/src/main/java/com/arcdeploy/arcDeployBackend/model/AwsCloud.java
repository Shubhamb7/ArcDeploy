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
public class AwsCloud {
    private String acId;
    private String accessKey;
    private String secretKey;
    private String projectName;
    private List<Region> regions;
}
