document.addEventListener('DOMContentLoaded', () => {
  const toolboxContainer = document.getElementById('toolbox-container');
  const awsLink = document.querySelector(".aws-toolbox");
  const openstackLink = document.querySelector(".openstack-toolbox");
  const toolboxItems = document.querySelectorAll('.toolbox-item');
  const drawingArea = document.getElementById('drawingArea');

  awsLink.addEventListener('click', (event) => {
    if (toolboxContainer.classList.contains('open')) {
      event.preventDefault();
      toolboxContainer.classList.remove('open');
      drawingArea.classList.remove('shift-left');
      awsLink.classList.remove('active');
    } else {
      event.preventDefault();
      toolboxContainer.classList.add('open');
      drawingArea.classList.add('shift-left');
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach(function(link) {
        link.classList.remove("active");
      });
      awsLink.classList.add("active");
    }
  });
  
  let selectedDiagram = null;
  let offsetX = 0;
  let offsetY = 0;
  let isResizing = false;
  let initialMouseX = 0;
  let initialMouseY = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let contextMenu = null; // Track the active context menu

  toolboxItems.forEach(item => {
    item.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', event.target.textContent);
    });
  });

  drawingArea.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  drawingArea.addEventListener('drop', (event) => {
    event.preventDefault();
    const diagramText = event.dataTransfer.getData('text/plain');
    const diagramElement = document.createElement('div');
    diagramElement.className = 'diagram';
    diagramElement.contentEditable = true;

    // Set the appropriate class based on the dropped diagram type
    if (diagramText === 'AWS Cloud') {
      diagramElement.classList.add('awscloud');
    } else if (diagramText === 'Region') {
      diagramElement.classList.add('region');
    } else if (diagramText === 'VPC') {
      diagramElement.classList.add('vpc');
    } else if (diagramText === 'IGW') {
      diagramElement.classList.add('igw');
    } else if (diagramText === 'NAT') {
      diagramElement.classList.add('nat');
    } else if (diagramText === 'Subnet') {
      diagramElement.classList.add('subnet');
    } else if (diagramText === 'Private Subnet') {
      diagramElement.classList.add('privatesubnet');
    } else if (diagramText === 'Region') {
      diagramElement.classList.add('region');
    } else if (diagramText === 'EC2') {
      diagramElement.classList.add('ec2');
    } else if (diagramText === 'SG') {
      diagramElement.classList.add('securitygroup');
    }

    diagramElement.textContent = diagramText;

    diagramElement.addEventListener('mousedown', (event) => {
      if (!isResizing) {
        selectedDiagram = diagramElement;
        offsetX = event.clientX - selectedDiagram.offsetLeft;
        offsetY = event.clientY - selectedDiagram.offsetTop;
      }
    });

    diagramElement.addEventListener('mousemove', (event) => {
      if (!isResizing && selectedDiagram === diagramElement) {
        const x = event.clientX - offsetX;
        const y = event.clientY - offsetY;
        selectedDiagram.style.left = x + 'px';
        selectedDiagram.style.top = y + 'px';
      }
    });

    diagramElement.addEventListener('mouseup', () => {
      selectedDiagram = null;
    });

    diagramElement.addEventListener('mouseleave', () => {
      selectedDiagram = null;
    });

    diagramElement.addEventListener('mousedown', (event) => {
      initialMouseX = event.clientX;
      initialMouseY = event.clientY;
      initialWidth = diagramElement.offsetWidth;
      initialHeight = diagramElement.offsetHeight;

      if (
        event.target.classList.contains('resize-handle') &&
        selectedDiagram === diagramElement
      ) {
        isResizing = true;
      }
    });

    diagramElement.addEventListener('mousemove', (event) => {
      if (isResizing && selectedDiagram === diagramElement) {
        const width = initialWidth + (event.clientX - initialMouseX);
        const height = initialHeight + (event.clientY - initialMouseY);
        diagramElement.style.width = width + 'px';
        diagramElement.style.height = height + 'px';
      }
    });

    diagramElement.addEventListener('mouseup', () => {
      isResizing = false;
    });

    let portsData = [];
    let sourceIpsData = [];
    let destIpsData = [];

    diagramElement.addEventListener('contextmenu', (event) => {
      if (event.button === 2 && diagramElement.classList.contains('awscloud')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        const project = diagramElement.dataset.project || 'test';
        const acid = diagramElement.dataset.acid || '162053822661';
        const accesskey = diagramElement.dataset.accesskey || 'AKIASLOZJDDC6JOGORVW';
        const secretkey = diagramElement.dataset.secretkey || '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';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
    
        const acidLabel = document.createElement('label');
        acidLabel.textContent = 'Account ID:';
        const acidInput = document.createElement('input');
        acidInput.type = 'text';
        acidInput.className = 'input-aws-account';
        acidInput.value = acid;

        const accessKeyLabel = document.createElement('label');
        accessKeyLabel.textContent = 'Access Key:';
        const accessKeyInput = document.createElement('input');
        accessKeyInput.type = 'text';
        accessKeyInput.className = 'input-aws-accesskey';
        accessKeyInput.value = accesskey;

        const secretKeyLabel = document.createElement('label');
        secretKeyLabel.textContent = 'Secret Access Key:';
        const secretKeyInput = document.createElement('input');
        secretKeyInput.type = 'text';
        secretKeyInput.className = 'input-aws-secretkey';
        secretKeyInput.value = secretkey;

        const projectLabel = document.createElement('label');
        projectLabel.textContent = 'Project Name:';
        const projectInput = document.createElement('input');
        projectInput.type = 'text';
        projectInput.className = 'input-aws-project';
        projectInput.value = project;

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
              diagramElement.dataset.project = projectInput.value;
              diagramElement.dataset.acid = acidInput.value;
              diagramElement.dataset.secretkey = secretKeyInput.value;
              diagramElement.dataset.accesskey = accessKeyInput.value;
              closeContextMenu(); // Close the context menu after clicking OK
          });
    
        contextMenu.appendChild(acidLabel);
        contextMenu.appendChild(acidInput);
        contextMenu.appendChild(accessKeyLabel);
        contextMenu.appendChild(accessKeyInput);
        contextMenu.appendChild(secretKeyLabel);
        contextMenu.appendChild(secretKeyInput);
        contextMenu.appendChild(projectLabel);
        contextMenu.appendChild(projectInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('region')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        const regionName = diagramElement.dataset.regionName || 'us-west-1';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
    
        const awsRegionLabel = document.createElement('label');
        awsRegionLabel.textContent = 'AWS Region:';
        const awsRegionInput = document.createElement('input');
        awsRegionInput.type = 'text';
        awsRegionInput.className = 'input-aws-region';
        awsRegionInput.value = regionName;
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
              diagramElement.dataset.regionName = awsRegionInput.value;
              closeContextMenu(); // Close the context menu after clicking OK
          });
    
        contextMenu.appendChild(awsRegionLabel);
        contextMenu.appendChild(awsRegionInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('vpc')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
    
        const cidrLabel = document.createElement('label');
        cidrLabel.textContent = 'CIDR:';
        const cidrInput = document.createElement('input');
        cidrInput.type = 'text';
        cidrInput.className = 'input-cidr';
        cidrInput.value = diagramElement.dataset.cidr || '10.10.0.0/16';
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
          diagramElement.dataset.cidr = cidrInput.value;
          closeContextMenu(); // Close the context menu after clicking OK
        });
    
        contextMenu.appendChild(cidrLabel);
        contextMenu.appendChild(cidrInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('subnet') || event.button === 2 && diagramElement.classList.contains('privatesubnet')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu

        const diagramElement = event.target;
        const availabilityZone = diagramElement.dataset.availabilityZone || 'us-west-1a';
        const subnetCidr = diagramElement.dataset.subnetCidr || '10.10.1.0/24';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
    
        const availabilityZoneLabel = document.createElement('label');
        availabilityZoneLabel.textContent = 'Availability Zone:';
        const availabilityZoneInput = document.createElement('input');
        availabilityZoneInput.type = 'text';
        availabilityZoneInput.className = 'input-availability-zone';
        availabilityZoneInput.value = availabilityZone;
    
        const subnetCidrLabel = document.createElement('label');
        subnetCidrLabel.textContent = 'Subnet CIDR:';
        const subnetCidrInput = document.createElement('input');
        subnetCidrInput.type = 'text';
        subnetCidrInput.className = 'input-subnet-cidr';
        subnetCidrInput.value = subnetCidr;
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
            diagramElement.dataset.availabilityZone = availabilityZoneInput.value;
            diagramElement.dataset.subnetCidr = subnetCidrInput.value;
            closeContextMenu(); // Close the context menu after clicking OK
        });
    
        contextMenu.appendChild(availabilityZoneLabel);
        contextMenu.appendChild(availabilityZoneInput);
        contextMenu.appendChild(subnetCidrLabel);
        contextMenu.appendChild(subnetCidrInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('nat')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        const natSubnet = diagramElement.dataset.natSubnet || '';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
    
        const natLabel = document.createElement('label');
        natLabel.textContent = 'Private Subnet Cidrs:';
        const natInput = document.createElement('input');
        natInput.type = 'text';
        natInput.className = 'input-nat-subnets';
        natInput.value = natSubnet;
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
              diagramElement.dataset.natSubnet = natInput.value;
              closeContextMenu(); // Close the context menu after clicking OK
          });

        contextMenu.appendChild(natLabel);
        contextMenu.appendChild(natInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('securitygroup')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        let sgRules = diagramElement.sgRules || [];
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'right-click-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.classList.add("show");
        
        const columnsDiv = document.createElement("div");
        columnsDiv.classList.add("columns");
        contextMenu.appendChild(columnsDiv);

        const portColumns = document.createElement("div");
        portColumns.classList.add("column");
        const portLabel = document.createElement("label");
        portLabel.textContent = "Port Number";
        portColumns.appendChild(portLabel);
        columnsDiv.appendChild(portColumns);
        
        const sourceIpColumns = document.createElement("div");
        sourceIpColumns.classList.add("column");
        const sourceIpLabel = document.createElement("label");
        sourceIpLabel.textContent = "Source Ips";
        sourceIpColumns.appendChild(sourceIpLabel);
        columnsDiv.appendChild(sourceIpColumns);

        const addButton = document.createElement("button");
        addButton.textContent = "Add Rule";
        addButton.addEventListener("click", addRow);
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
          const ports = Array.from(document.querySelectorAll(".port-input")).map(
            (input) => input.value
          );
          const sourceIps = Array.from(document.querySelectorAll(".source-input")).map(
            (input) => input.value
          );
        
          const objectArray = [];
          const newPortsData = [];
          const newSourceIpsData = [];
          for (let i = 0; i < ports.length; i++) {
            const object = {
              port: ports[i],
              sourceIp: sourceIps[i]
            };
            newPortsData.push(object.port)
            newSourceIpsData.push(object.sourceIp)
            objectArray.push(object);
          }

          portsData = newPortsData;
          sourceIpsData = newSourceIpsData;
          diagramElement.sgRules = objectArray;
          closeContextMenu(); 
        });
    
        contextMenu.appendChild(addButton);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);

        for (let i = 0; i < portsData.length; i++) {
          const portInput = document.createElement("input");
          portInput.type = "text";
          portInput.className = "port-input";
          portInput.value = getDataByIndex(0, i);
          portColumns.appendChild(portInput);
      
          const sourceIpInput = document.createElement("input");
          sourceIpInput.type = "text";
          sourceIpInput.className = "source-input";
          sourceIpInput.value = getDataByIndex(1, i);
          sourceIpColumns.appendChild(sourceIpInput);
        }

        function getDataByIndex(index, i) {
          if (index === 0) {
            return portsData[i] || "";
          } else if (index === 1) {
            return sourceIpsData[i] || "";
          }
        }
        
        function addRow() {
          const columns = document.querySelectorAll(".column");
          const classNames = ["port-input", "source-input"];
          
          columns.forEach((column, index) => {
            const input = document.createElement("input");
            input.type = "text";
            input.className = classNames[index];
            column.appendChild(input);
          });
        }

      } else if (event.button === 2 && diagramElement.classList.contains('ec2')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu

        const diagramElement = event.target;
        const ec2Data = {
          keyPair: diagramElement.dataset.keyPair || 'kafkacali',
          instanceType: diagramElement.dataset.instanceType || 't2.small',
          operatingSystem: diagramElement.dataset.operatingSystem || 'ubuntu',
          operatingSystemVersion: diagramElement.dataset.operatingSystem || '20.04',
          ephemeralStorage: diagramElement.dataset.ephemeralStorage || '30',
        };

        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';

        const keyPairLabel = document.createElement('label');
        keyPairLabel.textContent = 'Key Pair Name:';
        const keyPairInput = document.createElement('input');
        keyPairInput.type = 'text';
        keyPairInput.className = 'input-key-type';
        keyPairInput.value = ec2Data.keyPair;

        const instanceTypeLabel = document.createElement('label');
        instanceTypeLabel.textContent = 'Instance Type:';
        const instanceTypeInput = document.createElement('input');
        instanceTypeInput.type = 'text';
        instanceTypeInput.className = 'input-instance-type';
        instanceTypeInput.value = ec2Data.instanceType;

        const operatingSystemLabel = document.createElement('label');
        operatingSystemLabel.textContent = 'Operating System:';
        const operatingSystemInput = document.createElement('select');
        operatingSystemInput.className = 'input-operating-system';
        const ubuntuOption = document.createElement('option');
        ubuntuOption.value = 'ubuntu';
        ubuntuOption.textContent = 'Ubuntu';
        const debianOption = document.createElement('option');
        debianOption.value = 'debian';
        debianOption.textContent = 'Debian';
        operatingSystemInput.appendChild(ubuntuOption);
        operatingSystemInput.appendChild(debianOption);
        operatingSystemInput.value = ec2Data.operatingSystem;

        const versionLabel = document.createElement('label');
        versionLabel.textContent = 'OS Version:';
        const versionInput = document.createElement('select');
        versionInput.className = 'input-operating-system-version';
        function updateVersionOptions() {
          while (versionInput.firstChild) {
            versionInput.firstChild.remove();
          }
          const selectedOperatingSystem = operatingSystemInput.value;
          if (selectedOperatingSystem === 'ubuntu') {
            const version2004Option = document.createElement('option');
            version2004Option.value = '20.04';
            version2004Option.textContent = '20.04';

            const version2204Option = document.createElement('option');
            version2204Option.value = '22.04';
            version2204Option.textContent = '22.04';

            versionInput.appendChild(version2004Option);
            versionInput.appendChild(version2204Option);
          } else if (selectedOperatingSystem === 'debian') {
            const version11Option = document.createElement('option');
            version11Option.value = '11';
            version11Option.textContent = '11';

            versionInput.appendChild(version11Option);
          }
        }
        operatingSystemInput.addEventListener('change', updateVersionOptions);
        versionInput.value = ec2Data.operatingSystemVersion;
        updateVersionOptions();

        const ephemeralStorageLabel = document.createElement('label');
        ephemeralStorageLabel.textContent = 'Ephemeral Storage(GB):';
        const ephemeralStorageInput = document.createElement('input');
        ephemeralStorageInput.type = 'text';
        ephemeralStorageInput.className = 'input-ephemeral-storage';
        ephemeralStorageInput.value = ec2Data.ephemeralStorage;

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';

        okButton.addEventListener('click', () => {
          diagramElement.dataset.instanceType = instanceTypeInput.value;
          diagramElement.dataset.operatingSystem = operatingSystemInput.value;
          diagramElement.dataset.operatingSystemVersion = versionInput.value;
          diagramElement.dataset.keyPair = keyPairInput.value;
          diagramElement.dataset.ephemeralStorage = ephemeralStorageInput.value;
          closeContextMenu(); // Close the context menu after clicking OK
        });

        contextMenu.appendChild(instanceTypeLabel);
        contextMenu.appendChild(instanceTypeInput);
        contextMenu.appendChild(operatingSystemLabel);
        contextMenu.appendChild(operatingSystemInput);
        contextMenu.appendChild(versionLabel);
        contextMenu.appendChild(versionInput);
        contextMenu.appendChild(keyPairLabel);
        contextMenu.appendChild(keyPairInput);
        contextMenu.appendChild(ephemeralStorageLabel);
        contextMenu.appendChild(ephemeralStorageInput);
        contextMenu.appendChild(okButton);

        document.body.appendChild(contextMenu);
      } 

    });
    drawingArea.appendChild(diagramElement);
  });

  const trackButton = document.getElementById('trackButton');
  trackButton.addEventListener('click', () => {
    const hierarchy = generateHierarchy(drawingArea);
    const json = JSON.stringify(hierarchy, null, 2);
    console.log(json);
    const url = 'http://54.183.143.32:8080/arc';

    trackButton.disabled = true;
    trackButton.textContent = 'Deploying...';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: json
    })
      .then(response => response.json())
      .then(result => {
        console.log('Response:', result);
        trackButton.disabled = false;
        trackButton.textContent = 'Deploy';
      })
      .catch(error => {
        console.error('Error:', error);
        trackButton.disabled = false;
        trackButton.textContent = 'Deploy';
      });
    
  });

  const destroyButton = document.getElementById('destroyButton');
  destroyButton.addEventListener('click', () => {
    const hierarchy = generateHierarchy(drawingArea);
    const json = JSON.stringify(hierarchy, null, 2);
    console.log(json);
    const url = 'http://54.183.143.32:8080/arc';

    destroyButton.disabled = true;
    destroyButton.textContent = 'Destroying...';

    fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: json
    })
      .then(response => response.json())
      .then(result => {
        console.log('Response:', result);
        destroyButton.disabled = false;
        destroyButton.textContent = 'Destroy';
      })
      .catch(error => {
        console.error('Error:', error);
        destroyButton.disabled = false;
        destroyButton.textContent = 'Destroy';
      });
    
  });

  
  function generateHierarchy(element) {
    const children = Array.from(element.childNodes).filter(child => child.nodeType === Node.ELEMENT_NODE);
    const aws = [];
    const regions = [];
    const vpcs = [];
    const subnets = [];
    const nats = [];
    const sgs = [];
    const instances = [];
  
    children.forEach(child => {
      const name = child.textContent.trim();
      const type = child.classList.contains('ec2') ? 'EC2' : child.classList.contains('subnet') ? 'Subnet' : child.classList.contains('privatesubnet') ? 'PrivateSubnet' : child.classList.contains('vpc') ? 'VPC' : child.classList.contains('region') ? 'Region' : child.classList.contains('awscloud') ? 'AWS' : child.classList.contains('nat') ? 'Nat' : child.classList.contains('securitygroup') ? 'SG' : null;
      const { left, top, width, height } = child.getBoundingClientRect();

      if (type === 'EC2') {
        const keyPair = child.dataset.keyPair || '';
        const instanceType = child.dataset.instanceType || '';
        const operatingSystem = child.dataset.operatingSystem || '';
        const operatingSystemVersion = child.dataset.operatingSystemVersion || '';
        const ephemeralStorage = child.dataset.ephemeralStorage || '';
  
        instances.push({
          name,
          type,
          instanceType,
          operatingSystem,
          operatingSystemVersion,
          keyPair,
          ephemeralStorage
        });
      }

      if (type === 'SG') {
        const sgRules = child.sgRules || [];
        const instances = children
          .filter(c => c.classList.contains('ec2'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(ec2 => ({
            name: ec2.textContent.trim(),
            type: 'EC2',
            instanceType: ec2.dataset.instanceType || '',
            operatingSystem: ec2.dataset.operatingSystem || '',
            operatingSystemVersion: ec2.dataset.operatingSystemVersion || '',
            keyPair: ec2.dataset.keyPair || '',
            ephemeralStorage: ec2.dataset.ephemeralStorage || ''
          }));
  
        const securityGroup = {
          name,
          type,
          sgRules,
          instances
        };
  
        sgs.push(securityGroup);
      }
  
      if (type === 'Subnet') {
        const availabilityZone = child.dataset.availabilityZone || '';
        const subnetCidr = child.dataset.subnetCidr || '';
        let nat = false;
  
        const subnet = {
          name,
          type,
          availabilityZone,
          subnetCidr,
          nat,
          instances: []
        };

        if (children
          .filter(c => c.classList.contains('nat'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          }).length > 0){
            
            subnet.nat = true;
            const subnetNat = children
            .filter(c => c.classList.contains('nat'))
            .filter(c => {
              const { left: childLeft, top: childTop } = c.getBoundingClientRect();
              return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
                childTop >= top && childTop + c.offsetHeight <= top + height;
            }).map(natele => ({
              publicSubnetCidr: subnetCidr,
              privateSubnet: natele.dataset.natSubnet.split(',') || [],
            }));
            nats.push(subnetNat[0]);
          }
        
        const subnetInstances = children
          .filter(c => c.classList.contains('ec2'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(ec2 => ({
            name: ec2.textContent.trim(),
            type: 'EC2',
            instanceType: ec2.dataset.instanceType || '',
            operatingSystem: ec2.dataset.operatingSystem || '',
            operatingSystemVersion: ec2.dataset.operatingSystemVersion || '',
            keyPair: ec2.dataset.keyPair || '',
            ephemeralStorage: ec2.dataset.ephemeralStorage || ''
          }));
  
        subnet.instances.push(...subnetInstances);
        subnets.push(subnet);
      }

      if (type === 'PrivateSubnet') {
        const availabilityZone = child.dataset.availabilityZone || '';
        const subnetCidr = child.dataset.subnetCidr || '';
        const nat = false;

        const subnet = {
          name,
          type,
          availabilityZone,
          subnetCidr,
          nat,
          instances: []
        };
  
        const subnetInstances = children
          .filter(c => c.classList.contains('ec2'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(ec2 => ({
            name: ec2.textContent.trim(),
            type: 'EC2',
            instanceType: ec2.dataset.instanceType || '',
            operatingSystem: ec2.dataset.operatingSystem || '',
            operatingSystemVersion: ec2.dataset.operatingSystemVersion || '',
            keyPair: ec2.dataset.keyPair || '',
            ephemeralStorage: ec2.dataset.ephemeralStorage || ''
          }));
  
        subnet.instances.push(...subnetInstances);
        subnets.push(subnet);
      }

      if (type === 'VPC') {
        const cidr = child.dataset.cidr || '';
        const sgRules = child.sgRules || [];
        let igw = false

        const vpc = {
          name,
          type,
          cidr,
          igw,
          subnets: [],
          sgs: []
        };

        children.filter(c => c.classList.contains('igw'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          }).length > 0 ? vpc.igw=true: vpc.igw=false;

        const vpcSubnets = children
          .filter(c => c.classList.contains('subnet') || c.classList.contains('privatesubnet'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(subnet => ({
            name: subnet.textContent.trim(),
            type: subnet.classList.contains('privatesubnet') ? 'PrivateSubnet' : 'Subnet',
            availabilityZone: subnet.dataset.availabilityZone || '',
            subnetCidr: subnet.dataset.subnetCidr || '',
            nat: null,
            instances: []
          }));

        const vpcsgs = children
          .filter(c => c.classList.contains('securitygroup'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(sg => ({
            name: sg.textContent.trim(),
            type: 'SG',
            sgRules: sg.sgRules || [],
            instances: []
          }));

        vpc.subnets.push(...vpcSubnets);
        vpc.sgs.push(...vpcsgs);
        vpcs.push(vpc);
      }
  
      if (type === 'Region') {
        const regionName = child.dataset.regionName || '';
  
        const regionObj = {
          name,
          type,
          regionName,
          vpcs: []
        };
  
        const regionVpcs = children
          .filter(c => c.classList.contains('vpc'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(vpc => ({
            name: vpc.textContent.trim(),
            type: 'VPC',
            cidr: vpc.dataset.cidr || '',
            igw: null,
            subnets: []
          }));
  
        regionObj.vpcs.push(...regionVpcs);
        regions.push(regionObj);
      }

      if (type === 'AWS') {
        acId = child.dataset.acid || '';
        accessKey = child.dataset.accesskey || '';
        secretKey = child.dataset.secretkey || '';
        projectName = child.dataset.project || '';
  
        const awsObj = {
          acId,
          accessKey,
          secretKey,
          projectName,
          regions: []
        };
  
        const awsRegions = children
          .filter(c => c.classList.contains('region'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(region => ({
            name: region.textContent.trim(),
            type: 'Region',
            regionName: region.dataset.regionName || '',
            vpcs: []
          }));
  
        awsObj.regions.push(...awsRegions);
        aws.push(awsObj);

      }
    });
  
    return {
      aws,
      regions,
      vpcs,
      subnets,
      nats,
      sgs,
      instances
    };
  }

  function closeContextMenu() {
    if (contextMenu) {
      contextMenu.remove();
      contextMenu = null;
    }
  }
});
