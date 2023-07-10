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
    private String name;
    private String tagName;
    private String type;
    private String availabilityZone;
    private String subnetCidr;
    private Boolean nat;
    private List<Ec2> instances;
    private List<OpenVPN> openvpns;
}
