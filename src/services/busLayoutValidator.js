function validateBusLayout(config) {
  const errors = [];
  const warnings = [];
  const {
    busName = "",
    registrationNumber = "",
    deckType = "single",
    positions = []
  } = config;
  if (!busName.trim()) {
    errors.push("Bus display name is required.");
  }
  if (!registrationNumber.trim()) {
    errors.push("Vehicle registration number is required.");
  }
  const coordinateMap = /* @__PURE__ */ new Map();
  let hasOverlaps = false;
  for (const pos of positions) {
    if (typeof pos.row !== "number" || typeof pos.col !== "number") {
      errors.push(`Invalid position coordinates on ${pos.deck} deck: Row and Column must be numbers.`);
      continue;
    }
    const key = `${pos.deck}-r${pos.row}-c${pos.col}`;
    const existing = coordinateMap.get(key) || [];
    existing.push(pos);
    coordinateMap.set(key, existing);
  }
  coordinateMap.forEach((items, key) => {
    if (items.length > 1) {
      hasOverlaps = true;
      const [deck, r, c] = key.split("-");
      const descList = items.map((i) => `'${i.label || i.type}'`).join(" and ");
      errors.push(
        `Coordinate overlap conflict on ${deck.toUpperCase()} deck at ${r.toUpperCase()} ${c.toUpperCase()}: ${descList} occupy the exact same physical slot.`
      );
    }
  });
  const passengerPositions = positions.filter(
    (p) => ["seater", "semi_sleeper", "single_sleeper", "double_sleeper"].includes(p.type)
  );
  let hasUniqueLabels = true;
  const labelMap = /* @__PURE__ */ new Map();
  for (const pos of passengerPositions) {
    const rawLabel = (pos.label || "").trim();
    if (!rawLabel) {
      hasUniqueLabels = false;
      errors.push(
        `Missing seat label: Passenger position at ${pos.deck.toUpperCase()} deck (Row ${pos.row}, Col ${pos.col}) has no identifier.`
      );
      continue;
    }
    const normalized = rawLabel.toUpperCase();
    const existing = labelMap.get(normalized) || [];
    existing.push(pos);
    labelMap.set(normalized, existing);
  }
  labelMap.forEach((positionsWithLabel, label) => {
    if (positionsWithLabel.length > 1) {
      hasUniqueLabels = false;
      const locations = positionsWithLabel.map((p) => `${p.deck.toUpperCase()} (R${p.row}, C${p.col})`).join(", ");
      errors.push(
        `Duplicate seat label '${label}' detected at multiple positions: ${locations}. Every passenger berth/seat must have a unique label.`
      );
    }
  });
  const lowerPositions = positions.filter((p) => p.deck === "lower");
  const upperPositions = positions.filter((p) => p.deck === "upper");
  const lowerExits = lowerPositions.filter((p) => p.type === "emergency_exit");
  const upperExits = upperPositions.filter((p) => p.type === "emergency_exit");
  const lowerStairs = lowerPositions.filter((p) => p.type === "stairs");
  const upperStairs = upperPositions.filter((p) => p.type === "stairs");
  const doors = lowerPositions.filter((p) => p.type === "door");
  const driverPositions = lowerPositions.filter((p) => p.type === "driver");
  let emergencyExitsValid = true;
  let stairsValid = true;
  let doorsValid = true;
  let driverCabinValid = true;
  if (lowerExits.length === 0) {
    emergencyExitsValid = false;
    errors.push(
      "Safety Compliance Violation: Lower deck must have at least one designated Emergency Exit marker for passenger egress."
    );
  }
  if (deckType === "double") {
    if (upperExits.length === 0) {
      emergencyExitsValid = false;
      errors.push(
        "Safety Compliance Violation: Upper deck must have at least one designated Emergency Exit marker (e.g. roof hatch or rear emergency exit)."
      );
    }
  }
  for (const exit of [...lowerExits, ...upperExits]) {
    if (exit.label && exit.label.match(/^[LUS][0-9]+/i)) {
      warnings.push(
        `Notice: Emergency exit marker at ${exit.deck} deck (R${exit.row}, C${exit.col}) has passenger seat label '${exit.label}'. Safety exits cannot be booked as passenger seats.`
      );
    }
  }
  if (deckType === "double") {
    if (lowerStairs.length === 0) {
      stairsValid = false;
      errors.push(
        "Double-Deck Configuration Violation: Lower deck must include a Staircase marker to provide passenger access to the upper deck."
      );
    }
    if (upperStairs.length === 0) {
      stairsValid = false;
      errors.push(
        "Double-Deck Configuration Violation: Upper deck must include a Staircase landing marker connected to the lower deck stairs."
      );
    }
    if (lowerStairs.length > 0 && upperStairs.length > 0) {
      const lowerStair = lowerStairs[0];
      const upperStair = upperStairs[0];
      const rowDiff = Math.abs(lowerStair.row - upperStair.row);
      const colDiff = Math.abs(lowerStair.col - upperStair.col);
      if (rowDiff > 2 || colDiff > 2) {
        warnings.push(
          `Staircase warning: Lower deck stairs (R${lowerStair.row}, C${lowerStair.col}) and Upper deck stairs (R${upperStair.row}, C${upperStair.col}) are spaced far apart. Ensure passenger staircase path is vertically aligned.`
        );
      }
    }
  } else {
    if (lowerStairs.length > 0 || upperStairs.length > 0) {
      warnings.push(
        "Single deck bus has staircase markers configured. Stairs are only required for double-deck coaches."
      );
    }
  }
  if (doors.length === 0) {
    doorsValid = false;
    errors.push(
      "Safety & Boarding Compliance: Bus layout must have at least one passenger entrance door marker on the lower deck."
    );
  }
  if (driverPositions.length === 0) {
    driverCabinValid = false;
    warnings.push(
      "Recommended: Add a Driver Cabin marker at the front of the bus to clearly separate the driver control area from passenger seating."
    );
  }
  const totalCapacity = passengerPositions.length;
  const capacityValid = totalCapacity > 0;
  if (!capacityValid) {
    errors.push("Bus layout must contain at least one passenger seat or berth.");
  }
  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    warnings,
    checks: {
      noOverlaps: !hasOverlaps,
      uniqueLabels: hasUniqueLabels,
      emergencyExitsValid,
      stairsValid,
      doorsValid,
      driverCabinValid,
      capacityValid
    },
    stats: {
      totalSeats: totalCapacity,
      lowerSeats: lowerPositions.filter(
        (p) => ["seater", "semi_sleeper", "single_sleeper", "double_sleeper"].includes(p.type)
      ).length,
      upperSeats: upperPositions.filter(
        (p) => ["seater", "semi_sleeper", "single_sleeper", "double_sleeper"].includes(p.type)
      ).length,
      lowerExits: lowerExits.length,
      upperExits: upperExits.length,
      lowerStairs: lowerStairs.length,
      upperStairs: upperStairs.length,
      doors: doors.length,
      driverPositions: driverPositions.length
    },
    auditId: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
    validatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function autoFixSafetyMarkers(currentPositions, deckType) {
  let updated = [...currentPositions];
  const findEmptySlotOrReplaceEmpty = (deck, preferredRow, preferredCol) => {
    const existing = updated.find((p) => p.deck === deck && p.row === preferredRow && p.col === preferredCol);
    if (!existing || existing.type === "empty" || existing.type === "aisle") {
      return { row: preferredRow, col: preferredCol };
    }
    const maxRow = Math.max(1, ...updated.filter((p) => p.deck === deck).map((p) => p.row));
    return { row: maxRow + 1, col: preferredCol };
  };
  const hasDoor = updated.some((p) => p.deck === "lower" && p.type === "door");
  if (!hasDoor) {
    const slot = findEmptySlotOrReplaceEmpty("lower", 1, 3);
    updated = updated.filter((p) => !(p.deck === "lower" && p.row === slot.row && p.col === slot.col));
    updated.push({
      id: `lower-door-${Date.now()}`,
      label: "ENTRY DOOR",
      deck: "lower",
      row: slot.row,
      col: slot.col,
      type: "door",
      basePrice: 0,
      status: "available"
    });
  }
  const hasDriver = updated.some((p) => p.deck === "lower" && p.type === "driver");
  if (!hasDriver) {
    const slot = findEmptySlotOrReplaceEmpty("lower", 1, 0);
    updated = updated.filter((p) => !(p.deck === "lower" && p.row === slot.row && p.col === slot.col));
    updated.push({
      id: `lower-driver-${Date.now()}`,
      label: "DRIVER CABIN",
      deck: "lower",
      row: slot.row,
      col: slot.col,
      type: "driver",
      basePrice: 0,
      status: "available"
    });
  }
  const hasLowerExit = updated.some((p) => p.deck === "lower" && p.type === "emergency_exit");
  if (!hasLowerExit) {
    const lowerMaxRow = Math.max(1, ...updated.filter((p) => p.deck === "lower").map((p) => p.row));
    const slot = findEmptySlotOrReplaceEmpty("lower", lowerMaxRow, 1);
    updated = updated.filter((p) => !(p.deck === "lower" && p.row === slot.row && p.col === slot.col));
    updated.push({
      id: `lower-exit-${Date.now()}`,
      label: "EMERGENCY EXIT",
      deck: "lower",
      row: slot.row,
      col: slot.col,
      type: "emergency_exit",
      basePrice: 0,
      status: "available"
    });
  }
  if (deckType === "double") {
    const hasUpperExit = updated.some((p) => p.deck === "upper" && p.type === "emergency_exit");
    if (!hasUpperExit) {
      const upperMaxRow = Math.max(1, ...updated.filter((p) => p.deck === "upper").map((p) => p.row));
      const slot = findEmptySlotOrReplaceEmpty("upper", upperMaxRow, 1);
      updated = updated.filter((p) => !(p.deck === "upper" && p.row === slot.row && p.col === slot.col));
      updated.push({
        id: `upper-exit-${Date.now()}`,
        label: "EMERGENCY EXIT",
        deck: "upper",
        row: slot.row,
        col: slot.col,
        type: "emergency_exit",
        basePrice: 0,
        status: "available"
      });
    }
    const hasLowerStairs = updated.some((p) => p.deck === "lower" && p.type === "stairs");
    const hasUpperStairs = updated.some((p) => p.deck === "upper" && p.type === "stairs");
    if (!hasLowerStairs) {
      const slot = findEmptySlotOrReplaceEmpty("lower", 2, 1);
      updated = updated.filter((p) => !(p.deck === "lower" && p.row === slot.row && p.col === slot.col));
      updated.push({
        id: `lower-stairs-${Date.now()}`,
        label: "STAIRS TO UPPER",
        deck: "lower",
        row: slot.row,
        col: slot.col,
        type: "stairs",
        basePrice: 0,
        status: "available"
      });
    }
    if (!hasUpperStairs) {
      const slot = findEmptySlotOrReplaceEmpty("upper", 2, 1);
      updated = updated.filter((p) => !(p.deck === "upper" && p.row === slot.row && p.col === slot.col));
      updated.push({
        id: `upper-stairs-${Date.now()}`,
        label: "STAIRS FROM LOWER",
        deck: "upper",
        row: slot.row,
        col: slot.col,
        type: "stairs",
        basePrice: 0,
        status: "available"
      });
    }
  }
  return updated;
}
export {
  autoFixSafetyMarkers,
  validateBusLayout
};
