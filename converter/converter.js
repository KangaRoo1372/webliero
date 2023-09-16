function convert() {
  const fileInput = document.getElementById("jsonFile");
  const status = document.getElementById("status");
  const downloadLink = document.getElementById("downloadLink");
  const result = document.getElementById("result");
  const orderWA = document.getElementById("orderWA");
  const lieroM8Plugin = document.getElementById("lieroM8Plugin");
  const warningElement = document.getElementById("warning");

  if (!fileInput.files[0]) {
    status.textContent = "Please select a file";
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function () {
    try {      
      const data = JSON5.parse(fileReader.result);
      const lwpString = convertToJsonString(data, orderWA.checked);
      const blob = new Blob([lwpString], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      result.textContent = lwpString;
      downloadLink.href = url;
      downloadLink.download = "converted.lwp";
      downloadLink.style.display = "block";
      if (data.weapons.length != 40 || data.wObjects.length != 40 || data.nObjects.length != 24 || data.sObjects.length != 14) {
      warningElement.style.display = "block";
    } else {warningElement.style.display = "none";}
      status.textContent = "Conversion successful!";
    } catch (error) {
      console.error(error);
      status.textContent = "Error converting file :(";
  }
};

  const file = fileInput.files[0];
  const fileName = file.name;
  if (fileName.endsWith(".json5")) {
    fileReader.readAsText(file, "UTF-8");
  } else if (fileName.endsWith(".json")) {
    fileReader.readAsText(file, "UTF-8");
  } else {
    status.textContent = "Please select a JSON or JSON5 file";
  }
}

function convertToJsonString(data, orderByWeaponName) {
  const lwpParams = [];
  const lwpOParams = [];
  const lwpSParams = [];
  const warningExtended = document.getElementById("warningext");
  const warningSpritesheet = document.getElementById("warningsprites");
  const warningTextures = document.getElementById("warningtextures");
  let ObjectOrder = lieroM8Plugin.checked ? -1 : 0;
  let SObjectOrder = lieroM8Plugin.checked ? -1 : 0;
  let weaponIndex = 0;

  let weaponSorted = data.weapons.map((w,idx) => {return {name:w.name,idSwap:(idx+1)}; }).sort((a,b) => {
    if (a.name<b.name) return -1;
    if (a.name>b.name) return 1;
    return 0;
  });

warningExtended.style.display = "none";
warningSpritesheet.style.display = "none";
warningTextures.style.display = "none";
	
  for (let i = 0; i < data.weapons.length; i++) {
    const weapon = data.weapons[i];
    const ignoredWeaponProperties = ["bulletType","laserBeam","distribution","id","reloadSound","$$hashKey"];
    weaponIndex++;
    const weaponParams = [];
    for (let paramName in weapon) {
        if (ignoredWeaponProperties.includes(paramName)) {
          continue;
        }
        let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
        let paramValue = weapon[paramName];

        if (lwpParamName === "BULLETSPEEDINHERIT") {
            lwpParamName = "WORMAFFECT"
            paramValue = paramValue != 0 ? 1 : 0;
        }

        if (lwpParamName === "BULLETSPEED") {
            lwpParamName = "SPEED"
            paramValue = paramValue < -327.68 ? -32768 : (paramValue > 327.67 ? 32767 : Math.floor(paramValue * 100));
        }

        if (lwpParamName === "RECOIL") {
            paramValue = Math.floor(Math.abs(paramValue * 100));
            if (paramValue>255) paramValue=255;
        }

        if (lwpParamName === "LAUNCHSOUND") {
            lwpParamName = "SOUNDLAUNCH"
            paramValue =  paramValue < 0 ? 0 : Math.floor(paramValue + 1);
        }

        if (lwpParamName === "PARTS") {
            lwpParamName = "NUMOBJECTS"
            paramValue =  paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
        }

        if (lwpParamName === "AMMO") {
            paramValue =  paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
        }

        if (lwpParamName === "DELAY") {
            lwpParamName = "SHOTDELAY"
            paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
        }

        if (lwpParamName === "PLAYRELOADSOUND") {
            lwpParamName = "RELOADSOUND";
        }

         if (lwpParamName === "LOADINGTIME") {
            paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
        }

        if (lwpParamName === "FIRECONE") {
            paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
        }
      
        if (lwpParamName === "LEAVESHELLDELAY") {
            lwpParamName = "SHELLDELAY"
            paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
        }

        if (lwpParamName === "LEAVESHELLS") {
            paramValue = paramValue < 0 ? 0 : (paramValue > 4 ? 4 : Math.floor(paramValue));
        }

        if (typeof paramValue === "boolean") {
          paramValue = paramValue ? "1" : "0";
        } 
        if (typeof paramValue === "number") {
          paramValue = Math.floor(paramValue);
        }

        weaponParams.push(`${lwpParamName}:${paramValue}`);
    }

doTheWobject(weaponIndex, data, weapon.bulletType, weaponParams, weaponSorted, orderByWeaponName, warningExtended, warningSpritesheet, warningTextures, lwpParams)
    }

for (let i = 0; i < data.nObjects.length; i++) {
      const nObject = data.nObjects[i];
      const ignoredNObjectProperties = ["id","name","teamImmunity","immutable","$$hashKey"];
      ObjectOrder++;
      const nObjectOParams = [];
      if (nObject.immutable==true || nObject.teamImmunity>0) {
       warningExtended.style.display = "block";
       console.log("extended property detected in nobject nid" + i);
      }
      if (nObject.startFrame>239) {
	      warningSpritesheet.style.display = "block";
	      console.log("spritesheet limit exceeded in nobject nid" + i);
      }
      if (nObject.dirtEffect>8) {
	      warningTextures.style.display = "block";
	      console.log("textures array limit exceeded in nobject nid" + i);
      }
      for (let paramName in nObject) {

	  if (ignoredNObjectProperties.includes(paramName)) {
            continue;
          }
          let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
          let paramValue = nObject[paramName];

          if (lwpParamName === "SPLINTERTYPE") {
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
          }

          if (lwpParamName === "CREATEONEXP") {
              lwpParamName = "CREATEONHIT";
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
          }

          if (lwpParamName === "DIRTEFFECT") {
              lwpParamName = "MAPCHANGE";
              paramValue = paramValue < 0 ? 0 : (paramValue > 8 ? 0 : Math.floor(paramValue + 1));
          }

          if (lwpParamName === "STARTFRAME") {
              lwpParamName = "ANIMSFRAME"
              paramValue = paramValue < 0 ? 0 : (paramValue < 110 ? 0 : (paramValue > 239 ? 0 : Math.floor(paramValue - 110)));
          }

          if (lwpParamName === "DETECTDISTANCE") {
              lwpParamName = "WORMDETECTRANGE"
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "BLOODONHIT") {
              lwpParamName = "BLOOD"
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "COLORBULLETS") {
              lwpParamName = "BULLETCOLOR";
          }

          if (lwpParamName === "SPLINTERCOLOUR") {
              lwpParamName = "SPLINTERCOLOR";
          }

          if (lwpParamName === "DRAWONMAP") {
              lwpParamName = "DRAWOBJECT";
          }

          if (lwpParamName === "EXPLGROUND") {
              lwpParamName = "GROUNDREMOVE";
          }

          if (lwpParamName === "AFFECTBYEXPLOSIONS") {
              lwpParamName = "EXPLODEAFFECT";
          }

          if (lwpParamName === "WORMDESTROY") {
              lwpParamName = "WORMREMOVE";
          }

          if (lwpParamName === "NUMFRAMES") {
              lwpParamName = "ANIMFRAMES";
	      paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "SPLINTERAMOUNT") {
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "TIMETOEXPLO") {
              lwpParamName = "TIMETOEXPLODE"
              paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
          }

          if (lwpParamName === "TIMETOEXPLOV") {
              lwpParamName = "TIMETOEXPLODEV"
              paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
          }

          if (lwpParamName === "BLOODTRAILDELAY") {
              lwpParamName = "BTRAILDELAY"
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "BLOODTRAIL") {
              lwpParamName = "BTRAIL";
          }

          if (lwpParamName === "LEAVEOBJ") {
              lwpParamName = "OTRAILTYPE";
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
          }

          if (lwpParamName === "LEAVEOBJDELAY") {
              lwpParamName = "OTRAILDELAY"
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "BOUNCE") {
              paramValue = paramValue < 0 ? 0 : (paramValue > 2.55 ? 255 : Math.floor(paramValue * 100));
          }

          if (lwpParamName === "SPEED") {
              paramValue = paramValue < -327.68 ? -32768 : (paramValue > 327.67 ? 32767 : Math.floor(paramValue * 100));
          }

          if (lwpParamName === "SPEEDV") {
              paramValue = paramValue < -327.68 ? -32768 : (paramValue > 327.67 ? 32767 : Math.floor(paramValue * 100));
          }

          if (lwpParamName === "DISTRIBUTION") {
              paramValue = paramValue >= 0.5 ? 32767 : (paramValue <= -0.5 ? -32768 : Math.floor(paramValue * 65536));
          }

          if (lwpParamName === "GRAVITY") {
              paramValue = paramValue >= 0.5 ? 32767 : (paramValue <= -0.5 ? -32768 : Math.floor(paramValue * 65536));
          }

          if (lwpParamName === "BLOWAWAY") {
              lwpParamName = "BLOW"
              paramValue = Math.floor(Math.abs(paramValue * 100));
              if (paramValue>255) paramValue=255;
          }

          if (lwpParamName === "HITDAMAGE") {
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (typeof paramValue === "boolean") {
            paramValue = paramValue ? "1" : "0";
          } else if (typeof paramValue === "number") {
            paramValue = Math.floor(paramValue);
          }

          nObjectOParams.push(`${lwpParamName}:${paramValue}`);
	      
      }

      if (nObjectOParams.length > 0) {
        lwpOParams.push(`OBJECT:${ObjectOrder}\r\n${nObjectOParams.join("\r\n")}\r\n`);
      }
  }

for (let i = 0; i < data.sObjects.length; i++) {
  const sObject = data.sObjects[i];
  const ignoredSObjectProperties = ["id","name","$$hashKey"];
  SObjectOrder++;
  const sObjectSParams = [];
      if (sObject.dirtEffect>8) {
	warningTextures.style.display = "block";
	console.log("textures array limit exceeded in sobject sid" + i);
      }
      for (let paramName in sObject) {

	  if (ignoredSObjectProperties.includes(paramName)) {
            continue;
          }
          let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
          let paramValue = sObject[paramName];

          if (lwpParamName === "DIRTEFFECT") {
              lwpParamName = "MAPCHANGE";
              paramValue = paramValue < 0 ? 0 : (paramValue > 8 ? 0 : Math.floor(paramValue + 1));
          }

          if (lwpParamName === "STARTFRAME") {
              lwpParamName = "ANIMSFRAME"
              paramValue = paramValue < 0 ? 0 : (paramValue > 109 ? 0 : Math.floor(paramValue));
          }

          if (lwpParamName === "DETECTRANGE") {
              lwpParamName = "WORMDETECTRANGE"
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "NUMFRAMES") {
              lwpParamName = "ANIMFRAMES"
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "ANIMDELAY") {
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "DAMAGE") {
              lwpParamName = "HITDAMAGE"
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "SHAKE") {
              lwpParamName = "EARTHQUAKE"
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "FLASH") {
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "NUMSOUNDS") {
              lwpParamName = "NUMOFSOUNDS"
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "STARTSOUND") {
              lwpParamName = "FIRSTSOUND";
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
          }

          if (lwpParamName === "BLOWAWAY") {
              lwpParamName = "BLOW"
              paramValue = paramValue < -30517 ? -1999999999 : (paramValue > 30517 ? 1999999999 : Math.floor(paramValue * 65536));
          }

          if (typeof paramValue === "boolean") {
            paramValue = paramValue ? "1" : "0";
          } else if (typeof paramValue === "number") {
            paramValue = Math.floor(paramValue);
          }

          sObjectSParams.push(`${lwpParamName}:${paramValue}`);

      }

      if (sObjectSParams.length > 0) {
        lwpSParams.push(`SOBJECT:${SObjectOrder}\r\n${sObjectSParams.join("\r\n")}\r\n`);
      }
}
   return `LIEROKIT:WEAPONPLUGIN\r\nPROMPT:This will activate the whole weapon list. Do you want to continue?\r\nOVERWRITE:1\r\n\r\n${lwpParams.join("\r\n")}\r\n${lwpOParams.join("\r\n")}\r\n${lwpSParams.join("\r\n")}`;
}

function doTheWobject(weaponIndex, data, wobjectId, weaponParams, weaponSorted, orderByWeaponName, warningExtended, warningSpritesheet, warningTextures, lwpParams) {
        const i = wobjectId;
        const wObject = data.wObjects[i];
        const ignoredWObjectProperties = ["id","name","speed","bounceFriction","repeat","immutable","fixed","behavior","platform","detonable","teamImmunity","removeOnSObject","platformWidth","platformHeight","platformVelocityAuto","$$hashKey","removeonsobject","overlay===undefined ? 0 : a","underlay===undefined ? 0 : a","overlay","underlay","behavior===undefined ? -1 : a"];
        const wObjectParams = [];
        if (wObject.behavior>=0 || wObject.detonable==true || wObject.immutable==true || wObject.fixed==true || wObject.platform==true || wObject.teamImmunity>0 || wObject.removeOnSObject==true || wObject.overlay==true) {
         warningExtended.style.display = "block";
         console.log("extended property detected in wobject wid" + i);
         }
        if (wObject.startFrame>239) {
      warningSpritesheet.style.display = "block";
      console.log("spritesheet limit exceeded in wobject wid" + i);
        }
        if (wObject.dirtEffect>8) {
      warningTextures.style.display = "block";
      console.log("textures array limit exceeded in wobject wid" + i);
        }

        for (let paramName in wObject) {
          if (ignoredWObjectProperties.includes(paramName)) {
            continue;
          }
            let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
            let paramValue = wObject[paramName];

            if (lwpParamName === "SHOTTYPE") {
                paramValue = paramValue < 0 ? 0 : (paramValue > 4 ? 4 : Math.floor(paramValue));
            }
 
            if (lwpParamName === "SPLINTERTYPE") {
                paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "CREATEONEXP") {
                lwpParamName = "CREATEONHIT";
                paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "PARTTRAILOBJ") {
                lwpParamName = "PTRAILPTYPE";
                paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "DIRTEFFECT") {
              lwpParamName = "MAPCHANGE";
              paramValue = paramValue < 0 ? 0 : (paramValue > 8 ? 0 : Math.floor(paramValue + 1));
            }
  
            if (lwpParamName === "OBJTRAILTYPE") {
                lwpParamName = "OTRAILTYPE";
                paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "STARTFRAME") {
                lwpParamName = "ANIMSFRAME"
                paramValue = paramValue < 0 ? -1 : (paramValue < 110 ? 0 : (paramValue > 239 ? 0 : Math.floor(paramValue - 110)));
            }
  
            if (lwpParamName === "DETECTDISTANCE") {
                lwpParamName = "WORMDETECTRANGE"
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }

            if (lwpParamName === "BLOODONHIT") {
                lwpParamName = "BLOOD"
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }

            if (lwpParamName === "ADDSPEED") {
                lwpParamName = "ACCADD"
                paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
            }

            if (lwpParamName === "SPLINTERCOLOUR") {
                lwpParamName = "SPLINTERCOLOR";
            }

            if (lwpParamName === "EXPLGROUND") {
                lwpParamName = "GROUNDEXPLODE";
            }
  
            if (lwpParamName === "COLLIDEWITHOBJECTS") {
                lwpParamName = "OBJECTCOLLIDE";
            }
  
            if (lwpParamName === "AFFECTBYEXPLOSIONS") {
                lwpParamName = "EXPLODEAFFECT";
            }
  
            if (lwpParamName === "COLORBULLETS") {
                lwpParamName = "BULLETCOLOR";
            }
  
            if (lwpParamName === "EXPLOSOUND") {
                lwpParamName = "SOUNDEXPLODE";
                paramValue = paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "PARTTRAILDELAY") {
                lwpParamName = "PTRAILDELAY"
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "PARTTRAILTYPE") {
                lwpParamName = "PTRAILTYPE";
                paramValue = paramValue < 0 ? 0 : (paramValue > 1 ? 1 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "WORMCOLLIDE") {
                lwpParamName = "WORMREMOVE";
            }
  
            if (lwpParamName === "SPLINTERSCATTER") {
                lwpParamName = "SPLINTERSTYPE";
                paramValue = paramValue < 0 ? 0 : (paramValue > 1 ? 1 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "NUMFRAMES") {
                lwpParamName = "ANIMFRAMES";
      		paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
          
            if (lwpParamName === "LOOPANIM") {
                lwpParamName = "ANIMLOOP";
            }
  
            if (lwpParamName === "SPLINTERAMOUNT") {
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "TIMETOEXPLO") {
                lwpParamName = "TIMETOEXPLODE"
                paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "TIMETOEXPLOV") {
                lwpParamName = "TIMETOEXPLODEV"
                paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "OBJTRAILDELAY") {
                lwpParamName = "OTRAILDELAY"
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "MULTSPEED") {
                lwpParamName = "ACCMULTIPLY"
                paramValue = paramValue < -327.68 ? -32768 : (paramValue > 327.67 ? 32767 : Math.floor(paramValue * 100));
            }
  
            if (lwpParamName === "BOUNCE") {
                paramValue = paramValue < 0 ? 0 : (paramValue > 2.55 ? 255 : Math.floor(paramValue * 100));
            }
  
            if (lwpParamName === "HITDAMAGE") {
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "DISTRIBUTION") {
                paramValue = paramValue >= 0.5 ? 32767 : (paramValue <= -0.5 ? -32768 : Math.floor(paramValue * 65536));
  
            }
  
            if (lwpParamName === "GRAVITY") {
                paramValue = paramValue >= 0.5 ? 32767 : (paramValue <= -0.5 ? -32768 : Math.floor(paramValue * 65536));
            }
  
            if (lwpParamName === "BLOWAWAY") {
                lwpParamName = "BLOW"
                paramValue = Math.floor(Math.abs(paramValue * 100));
                if (paramValue>255) paramValue=255;
            }
  
            if (typeof paramValue === "boolean") {
              paramValue = paramValue ? "1" : "0";
            } else if (typeof paramValue === "number") {
              paramValue = Math.floor(paramValue);
            }
  
            wObjectParams.push(`${lwpParamName}:${paramValue}`);
  
          }
  
        if (wObjectParams.length > 0) {
       
          const weaponOrder = orderByWeaponName
          ? weaponSorted[weaponIndex - 1].idSwap
          : weaponIndex;
        
          lwpParams.push(`WEAPON:${weaponIndex}\r\nORDER:${weaponOrder}\r\n${weaponParams.join("\r\n")}\r\n${wObjectParams.join("\r\n")}\r\nSHADOW:1\r\nSOUNDLOOP:0\r\n`);
        } 
}
