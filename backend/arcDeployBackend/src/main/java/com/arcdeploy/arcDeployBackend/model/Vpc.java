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
public class Vpc extends Subnet{
    protected String name;
    protected String type;
    protected String cidr;
    protected Boolean igw;
    private List<Subnet> subnets;
    private List<SG> sgs;
}
