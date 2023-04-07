function convert() {
  const fileInput = document.getElementById("jsonFile");
  const status = document.getElementById("status");
  const downloadLink = document.getElementById("downloadLink");
  const result = document.getElementById("result");
  const orderWA = document.getElementById("orderWA");

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
  let ObjectOrder = -1;
  let SObjectOrder = -1;

  let weaponSorted = data.weapons.map((w,idx) => {return {name:w.name,idSwap:(idx+1)}; }).sort((a,b) => {
    if (a.name<b.name) return -1
    if (a.name>b.name) return 1
    return 0
  })

  const ignoredWeaponProperties = ["bulletSpeed","bulletType","laserBeam", "distribution",  "id", "reloadSound", "$$hashKey"]
  for (let i = 0; i < data.weapons.length; i++) {
    const weapon = data.weapons[i];
    const weaponParams = [];
    for (let paramName in weapon) {
        if (ignoredWeaponProperties.includes(paramName)) {
          continue;
        }
        let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
        let paramValue = weapon[paramName];

        if (lwpParamName === "BULLETSPEEDINHERIT") {
            lwpParamName = "WORMAFFECT"
            paramValue = paramValue > 0 ? 1 : 0;
        }

        if (lwpParamName === "RECOIL") {
            lwpParamName = "RECOIL"
            paramValue < 0 ? 0 : Math.floor(Math.abs(paramValue * 100));
        }

        if (lwpParamName === "LAUNCHSOUND") {
            lwpParamName = "SOUNDLAUNCH"
            paramValue = Math.floor(paramValue + 1);
        }

        if (lwpParamName === "PARTS") {
            lwpParamName = "NUMOBJECTS";
        }

        if (lwpParamName === "DELAY") {
            lwpParamName = "SHOTDELAY";
        }

        if (lwpParamName === "PLAYRELOADSOUND") {
            lwpParamName = "RELOADSOUND";
        }

        if (typeof paramValue === "boolean") {
          paramValue = paramValue ? "1" : "0";
        } 
        if (typeof paramValue === "number") {
          paramValue = Math.floor(paramValue);
        }

        weaponParams.push(`${lwpParamName}:${paramValue}`);
    }

    const weaponIndex = parseInt(weapon.bulletType)+1;
    const wO = orderByWeaponName?weaponSorted[i].idSwap:i+1;
    if (weaponParams.length > 0) {
      lwpParams.push(`WEAPON:${weaponIndex}\nORDER:${wO}\n${weaponParams.join("\n")}`);
    }

    if (i < data.wObjects.length) {
      const wObject = data.wObjects[i];

      const wObjectParams = [];
      for (let paramName in wObject) {
        if (paramName !== "id" && paramName !== "name" && paramName !== "bounceFriction" && paramName !== "repeat" && paramName !== "immutable" && paramName !== "fixed" && paramName !== "behavior" && paramName !== "platform" && paramName !== "detonable" && paramName !== "teamImmunity" && paramName !== "removeOnSObject" && paramName !== "platformWidth" && paramName !== "platformHeight" && paramName !== "platformVelocityAuto" && paramName !== "$$hashKey" && paramName !== "removeonsobject") {
          let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
          let paramValue = wObject[paramName];

          if (lwpParamName === "SPLINTERTYPE") {
              lwpParamName = "SPLINTERTYPE";
              paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "CREATEONEXP") {
              lwpParamName = "CREATEONHIT";
              paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "PARTTRAILOBJ") {
              lwpParamName = "PTRAILPTYPE";
              paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "DIRTEFFECT") {
            lwpParamName = "MAPCHANGE";
            paramValue = Math.floor(paramValue + 1);
          }

           if (lwpParamName === "OBJTRAILTYPE") {
              lwpParamName = "OTRAILTYPE";
              paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "STARTFRAME") {
              lwpParamName = "ANIMSFRAME"
              paramValue = paramValue < 0 ? -1 : Math.floor(paramValue - 110);
          }

         if (lwpParamName === "DETECTDISTANCE") {
              lwpParamName = "WORMDETECTRANGE"
              paramValue = paramValue < 0 ? 0 : paramValue;
          }

         if (lwpParamName === "BLOODONHIT") {
              lwpParamName = "BLOOD";
          }

          if (lwpParamName === "ADDSPEED") {
              lwpParamName = "ACCADD"
              paramValue = Math.abs(paramValue);
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
              paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "PARTTRAILDELAY") {
              lwpParamName = "PTRAILDELAY";
          }

         if (lwpParamName === "PARTTRAILTYPE") {
              lwpParamName = "PTRAILTYPE";
          }

         if (lwpParamName === "WORMCOLLIDE") {
              lwpParamName = "WORMREMOVE";
          }

          if (lwpParamName === "SPLINTERSCATTER") {
              lwpParamName = "SPLINTERSTYPE";
          }

          if (lwpParamName === "NUMFRAMES") {
              lwpParamName = "ANIMFRAMES";
          }

          if (lwpParamName === "TIMETOEXPLO") {
              lwpParamName = "TIMETOEXPLODE"
              paramValue = paramValue < 0 ? 0 : paramValue;
          }

          if (lwpParamName === "TIMETOEXPLOV") {
              lwpParamName = "TIMETOEXPLODEV"
              paramValue = paramValue < 0 ? 0 : paramValue;
          }

         if (lwpParamName === "OBJTRAILDELAY") {
              lwpParamName = "OTRAILDELAY";
          }

          if (lwpParamName === "MULTSPEED") {
              lwpParamName = "ACCMULTIPLY"
              paramValue = Math.floor(paramValue * 100);
          }

         if (lwpParamName === "BOUNCE") {
              lwpParamName = "BOUNCE"
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue * 100);
          }

         if (lwpParamName === "DISTRIBUTION") {
              lwpParamName = "DISTRIBUTION"
              paramValue = Math.floor(Math.abs(paramValue * 65536));
          }

          if (lwpParamName === "GRAVITY") {
              lwpParamName = "GRAVITY"
              paramValue = Math.floor(paramValue * 65536);
          }

          if (lwpParamName === "BLOWAWAY") {
              lwpParamName = "BLOW"
              paramValue = Math.floor(Math.abs(paramValue * 100));
          }

          if (typeof paramValue === "boolean") {
            paramValue = paramValue ? "1" : "0";
          } else if (typeof paramValue === "number") {
            paramValue = Math.floor(paramValue);
          }

          wObjectParams.push(`${lwpParamName}:${paramValue}`);
        }
      }

      if (wObjectParams.length > 0) {
        lwpParams.push(`${wObjectParams.join("\n")}\nSHADOW:1\nSOUNDLOOP:0\n`);
      }
}
}
for (let i = 0; i < data.nObjects.length; i++) {
  const nObject = data.nObjects[i];
          ObjectOrder++;
      const nObjectOParams = [];
      for (let paramName in nObject) {
        if (paramName !== "id" && paramName !== "name" && paramName !== "teamImmunity" && paramName !== "immutable" && paramName !== "$$hashKey") {
          let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
          let paramValue = nObject[paramName];

           if (lwpParamName === "SPLINTERTYPE") {
              lwpParamName = "SPLINTERTYPE";
              paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "CREATEONEXP") {
              lwpParamName = "CREATEONHIT";
              paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "DIRTEFFECT") {
            lwpParamName = "MAPCHANGE";
            paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "STARTFRAME") {
              lwpParamName = "ANIMSFRAME"
              paramValue = paramValue <= 0 ? 0 : Math.floor(paramValue - 110);
          }

         if (lwpParamName === "DETECTDISTANCE") {
              lwpParamName = "WORMDETECTRANGE"
              paramValue = paramValue < 0 ? 0 : paramValue;
          }

         if (lwpParamName === "BLOODONHIT") {
              lwpParamName = "BLOOD";
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
          }

          if (lwpParamName === "TIMETOEXPLO") {
              lwpParamName = "TIMETOEXPLODE"
              paramValue = paramValue < 0 ? 0 : paramValue;
          }

          if (lwpParamName === "TIMETOEXPLOV") {
              lwpParamName = "TIMETOEXPLODEV"
              paramValue = paramValue < 0 ? 0 : paramValue;
          }

          if (lwpParamName === "BLOODTRAILDELAY") {
              lwpParamName = "BTRAILDELAY";
          }

          if (lwpParamName === "BLOODTRAIL") {
              lwpParamName = "BTRAIL";
          }

          if (lwpParamName === "LEAVEOBJ") {
              lwpParamName = "OTRAILTYPE";
              paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "LEAVEOBJDELAY") {
              lwpParamName = "OTRAILDELAY";
          }

         if (lwpParamName === "BOUNCE") {
              lwpParamName = "BOUNCE"
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue * 100);
          }

          if (lwpParamName === "SPEED") {
              lwpParamName = "SPEED"
              paramValue = Math.floor(Math.abs(paramValue * 100));
          }

          if (lwpParamName === "SPEEDV") {
              lwpParamName = "SPEEDV"
              paramValue = Math.floor(Math.abs(paramValue * 100));
          }

         if (lwpParamName === "DISTRIBUTION") {
              lwpParamName = "DISTRIBUTION"
              paramValue = Math.floor(Math.abs(paramValue * 65536));
          }

          if (lwpParamName === "GRAVITY") {
              lwpParamName = "GRAVITY"
              paramValue = Math.floor(paramValue * 65536);
          }

          if (lwpParamName === "BLOWAWAY") {
              lwpParamName = "BLOW"
              paramValue = Math.floor(Math.abs(paramValue * 100));
          }

          if (typeof paramValue === "boolean") {
            paramValue = paramValue ? "1" : "0";
          } else if (typeof paramValue === "number") {
            paramValue = Math.floor(paramValue);
          }

          nObjectOParams.push(`${lwpParamName}:${paramValue}`);
        }
      }

      if (nObjectOParams.length > 0) {
        lwpOParams.push(`OBJECT:${ObjectOrder}\n${nObjectOParams.join("\n")}\n`);
      }
  }

for (let i = 0; i < data.sObjects.length; i++) {
  const sObject = data.sObjects[i];
          SObjectOrder++;
      const sObjectSParams = [];
      for (let paramName in sObject) {
        if (paramName !== "id" && paramName !== "name" && paramName !== "$$hashKey") {
          let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
          let paramValue = sObject[paramName];

          if (lwpParamName === "DIRTEFFECT") {
            lwpParamName = "MAPCHANGE";
            paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "STARTFRAME") {
              lwpParamName = "ANIMSFRAME";
          }

         if (lwpParamName === "DETECTRANGE") {
              lwpParamName = "WORMDETECTRANGE"
              paramValue = Math.abs(paramValue);
          }

          if (lwpParamName === "NUMFRAMES") {
              lwpParamName = "ANIMFRAMES";
          }

          if (lwpParamName === "DAMAGE") {
              lwpParamName = "HITDAMAGE";
              paramValue = Math.abs(paramValue);
          }

          if (lwpParamName === "SHAKE") {
              lwpParamName = "EARTHQUAKE";
          }

              if (lwpParamName === "NUMSOUNDS") {
              lwpParamName = "NUMOFSOUNDS";
          }

          if (lwpParamName === "STARTSOUND") {
              lwpParamName = "FIRSTSOUND";
              paramValue = Math.floor(paramValue + 1);
          }

          if (lwpParamName === "BLOWAWAY") {
              lwpParamName = "BLOW"
              paramValue = Math.floor(Math.abs(paramValue * 65536));
          }

          if (typeof paramValue === "boolean") {
            paramValue = paramValue ? "1" : "0";
          } else if (typeof paramValue === "number") {
            paramValue = Math.floor(paramValue);
          }

          sObjectSParams.push(`${lwpParamName}:${paramValue}`);
        }
      }

      if (sObjectSParams.length > 0) {
        lwpSParams.push(`SOBJECT:${SObjectOrder}\n${sObjectSParams.join("\n")}\n`);
      }
}
   return `LIEROKIT:WEAPONPLUGIN\nPROMPT:This will activate the whole weapon list. Do you want to continue?\nOVERWRITE:1\n\n${lwpParams.join("\n")}\n${lwpOParams.join("\n")}\n${lwpSParams.join("\n")}`;
}
