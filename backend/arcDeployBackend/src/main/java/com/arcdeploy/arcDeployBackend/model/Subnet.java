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
public class Subnet extends Ec2{
    protected String name;
    protected String type;
    protected String availabilityZone;
    protected String subnetCidr;
    protected Boolean nat;
    private List<Ec2> instances;
}
