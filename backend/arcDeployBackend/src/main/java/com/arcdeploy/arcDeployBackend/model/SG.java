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
public class SG {
    private String name;
    private String tagName;
    private String type;
    private List<SgRule> SgRules;
    private List<Ec2> instances;
    private List<Alb> albs;
}
