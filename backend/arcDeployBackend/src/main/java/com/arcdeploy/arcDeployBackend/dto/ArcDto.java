package com.arcdeploy.arcDeployBackend.dto;

import com.arcdeploy.arcDeployBackend.model.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
public class ArcDto {
    private String arc;
    private List<AwsCloud> aws;
    private List<Region> regions;
    private List<Vpc> vpcs;
    private List<Subnet> subnets;
    private List<Nat> nats;
    private List<SG> sgs;
    private List<TG> tgs;
    private List<Ec2> instances;
}
