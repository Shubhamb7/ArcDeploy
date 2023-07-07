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
public class Vpc{
    private String name;
    private String tagName;
    private String type;
    private String cidr;
    private Boolean igw;
    private List<Subnet> subnets;
    private List<SG> sgs;
    private List<TG> tgs;
    private List<Alb> albs;
}
