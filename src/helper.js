export function generateCardsData() {
  let t = [];
  let cTypeConfig = ["spaek", "chiddi", "badam", "twinkle"];
  let cNameConfig = ["ekka", "jack", "queen", "king"];
  for (let i = 0; i < 4; i++) {
    t[i] = [];
    for (let j = 0; j <= 12; j++) {
      const cardName =
        j === 0
          ? cNameConfig[0]
          : j === 10
          ? cNameConfig[1]
          : j === 11
          ? cNameConfig[2]
          : j === 12
          ? cNameConfig[3]
          : (j + 1).toString();
      t[i][j] = {
        type: i,
        rank: j,
        label: `${cTypeConfig[i]}-${cardName}`,
        value: `${cTypeConfig[i]}-${cardName}`,
        data: cardName,
        cType: cTypeConfig[i],
        sortIndex: j + 1,
        specialSortIndex: j === 0 ? 1 : j === 11 ? 2 : j === 12 ? 3 : -1,
        royalSortIndex: j === 0 ? 12 : j - 1,
      };
    }
  }
  return t;
}

export function getCardsOptions({
  currentCards,
  selectedCardsA,
  selectedCardsB,
}) {
  const selectedCardsArray = [...selectedCardsA, ...selectedCardsB].map(
    ({ value }) => value
  );
  return currentCards
    .flatMap((typeData) => typeData)
    .map(({ value, ...rest }) => {
      return {
        value,
        ...rest,
        disabled: selectedCardsArray.includes(value),
      };
    });
}

export function sortViaSortIndex(a, b) {
  return a.sortIndex - b.sortIndex;
}

export function sortViaRoyalSortIndex(a, b) {
  return a.royalSortIndex - b.royalSortIndex;
}

export function sortViaSpecialSortIndex(a, b) {
  return a.specialSortIndex - b.specialSortIndex;
}

export function checkIfInSequence(dataArr) {
  return dataArr.every((curr, index, arr) => curr === arr[0] + index);
}

export function checkIfInSequenceForRoyalIndex(dataArr) {
  // This was added to handle B1-T2-C3
  if ([0, 1, 12].every((value, index) => dataArr[index] === value)) return true;
  return dataArr.every((curr, index, arr) => curr === arr[0] + index);
}

export function generateWinningConditionsArray({ currentCard }) {
  const { typeArray, sortIndexArray, rankArray } = currentCard
    .sort(sortViaSortIndex)
    .reduce(
      (acc, { type, sortIndex, rank }) => {
        acc["typeArray"].push(type);
        acc["sortIndexArray"].push(sortIndex);
        acc["rankArray"].push(rank);
        return acc;
      },
      {
        typeArray: [],
        sortIndexArray: [],
        rankArray: [],
      }
    );
  const specialSortIndexArray = currentCard
    .sort(sortViaSpecialSortIndex)
    .map(({ specialSortIndex }) => specialSortIndex);
  const royalSortIndexArray = currentCard
    .sort(sortViaRoyalSortIndex)
    .map(({ royalSortIndex }) => royalSortIndex);
  const priorityObj = {
    isRoyalFlush: checkIfRoyalFlush({ typeArray, specialSortIndexArray }),
    isStraightFlush: checkIfStraightFlush({ typeArray, sortIndexArray }),
    isThreeOfKind: checkIfThreeOfAKind({ rankArray }),
    isStraight: checkIfStraight({ typeArray, royalSortIndexArray }),
    isFlush:
      !checkIfRoyalFlush({ typeArray, specialSortIndexArray }) &&
      checkIfFlush({ typeArray, sortIndexArray }),
    isPair: checkIfPair({ rankArray }),
  };

  priorityObj.isHighCard = !Object.values(priorityObj)
    .map((values) => values)
    .some((values) => values);
  return { ...priorityObj };
}

export function checkIfRoyalFlush({ typeArray, specialSortIndexArray }) {
  // Priority 1.
  // Suited Ace, King, Queen
  // Eg. Twinkle Ace, King, Queen.
  if (typeArray.length < 3) return false;
  const checkIfSameType = typeArray.every((type) => type === typeArray[0]);
  return checkIfSameType && checkIfInSequence(specialSortIndexArray);
}

export function checkIfStraightFlush({ typeArray, sortIndexArray }) {
  // Priority 2.
  // Any 3 card in sequence but all of same suite
  // Eg. Chiddi 8,9 & 10.
  if (typeArray.length < 3) return false;
  const checkIfSameType = typeArray.every((type) => type === typeArray[0]);
  return checkIfSameType && checkIfInSequence(sortIndexArray);
}

export function checkIfThreeOfAKind({ rankArray }) {
  // Priority 3.
  // Any 3 card of the same value/rank
  // Eg. Twinkle, Chiddi & Badam 5.
  if (rankArray.length < 3) return false;
  const checkIfSameRank = rankArray.every((type) => type === rankArray[0]);
  return checkIfSameRank;
}

export function checkIfStraight({ typeArray, royalSortIndexArray }) {
  // Priority 4.
  // Any 3 cards of rank in at least two different suits.
  // E.g. Twinkle 2, Chiddi 3 & Badam 4 .
  // Two straights are ranked by comparing the highest card of each.
  if (typeArray.length < 3) return false;
  const checkIfNotUniqueType = new Set(typeArray).size !== 1;
  return (
    checkIfNotUniqueType && checkIfInSequenceForRoyalIndex(royalSortIndexArray)
  );
}

export function checkIfFlush({ typeArray, sortIndexArray }) {
  // Priority 5.
  // Flush is a hand where all three cards are of the same suit, but not in a sequence.
  //    E.g. three cards that are all chiddi.
  if (typeArray.length < 3) return false;
  const checkIfSameType = typeArray.every((type) => type === typeArray[0]);
  return checkIfSameType && !checkIfInSequence(sortIndexArray);
}

export function checkIfPair({ rankArray }) {
  // Priority 6.
  //   Pair is a hand that contains two cards of one rank plus one card that is not on this rank.
  //    E.g. two Kings of badam and an eight of chiddi.
  //  If two hands have the same pair then the kickers are compared to determine the winner.
  // if (rankArray.length < 3) return false;
  if (rankArray.length === 2) {
    return rankArray[0] === rankArray[1];
  } else {
    return (
      (rankArray[0] === rankArray[1] && rankArray[1] !== rankArray[2]) ||
      (rankArray[1] === rankArray[2] && rankArray[0] !== rankArray[1])
    );
  }
}

export function checkIfHighCard({
  priorityDataA,
  priorityDataB,
  playerASelect,
  playerBSelect,
}) {
  // Priority 7.
  // Any three cards not meeting any of the above requirements.
  // No Hand is made and the hand rank is according to the highest card.
  if (playerASelect.length < 3 && playerBSelect.length) return false;
  const isPlayerAHasNoOtherHand = !Object.values(priorityDataA).some(
    (values) => values
  );
  const isPlayerBHasNoOtherHand = !Object.values(priorityDataB).some(
    (values) => values
  );
  if (isPlayerAHasNoOtherHand && isPlayerBHasNoOtherHand) {
    const playerARankArray = playerASelect
      .sort(sortViaRoyalSortIndex)
      .map(({ royalSortIndex }) => royalSortIndex);
    const playerBRankArray = playerBSelect
      .sort(sortViaRoyalSortIndex)
      .map(({ royalSortIndex }) => royalSortIndex);
    if (playerARankArray[2] === playerBRankArray[2]) {
      const rankASum = playerARankArray.reduce((acc, curr) => acc + curr, 0);
      const rankBSum = playerBRankArray.reduce((acc, curr) => acc + curr, 0);
      return rankASum < rankBSum;
    } else if (playerARankArray[2] < playerBRankArray[2]) {
      return true;
    } else {
      return false;
    }
  } else return false;
}

export function checkRankIfSamePriority({
  playerASelect,
  playerBSelect,
  priority,
}) {
  const playerARankArray = playerASelect
    .sort(sortViaRoyalSortIndex)
    .map(({ royalSortIndex }) => royalSortIndex);
  const playerBRankArray = playerBSelect
    .sort(sortViaRoyalSortIndex)
    .map(({ royalSortIndex }) => royalSortIndex);
  let playerAPairedRank = playerARankArray[2];
  let playerBPairedRank = playerBRankArray[2];
  if (priority === 5) {
    // This if pair has same priority
    playerAPairedRank =
      playerARankArray[0] === playerARankArray[1]
        ? playerARankArray[0]
        : playerARankArray[1];
    playerBPairedRank =
      playerBRankArray[0] === playerBRankArray[1]
        ? playerBRankArray[0]
        : playerBRankArray[1];
  }
  if (playerAPairedRank === playerBPairedRank) {
    const rankASum = playerARankArray.reduce((acc, curr) => acc + curr, 0);
    const rankBSum = playerBRankArray.reduce((acc, curr) => acc + curr, 0);
    return rankASum < rankBSum;
  } else if (playerAPairedRank < playerBPairedRank) {
    return true;
  } else {
    return false;
  }
}

export function getDataSourceForStep5({
  playerASelect = [],
  playerDataA,
  playerBSelect,
  playerDataB,
}) {
  const { cards } = playerDataA;
  const currentCard = playerASelect.map((key) =>
    cards.find(({ value }) => value === key)
  );
  const conditionAtStep5 = Object.entries(
    generateWinningConditionsArray({ currentCard })
  );
  const columnData = conditionAtStep5.map(([key, value], index) => ({
    name: key,
    result: value === true ? "Yes" : "No",
    priority: `Priortiy ${index + 1}`,
  }));

  const isHighCard = checkIfHighCard({
    priorityDataA: playerDataB.data,
    priorityDataB: playerDataA.data,
    playerBSelect: playerDataA.cards,
    playerASelect: playerDataB.cards,
  });

  columnData.push({
    name: "isHighCard (Post Step 6)",
    result: isHighCard ? "Yes" : "No",
    priority: `Priority 7`,
  });

  return columnData;
}

export function isCurrentCardAValidAfterPriority({
  priorityDataB,
  priorityDataA,
  playerBSelect,
  playerASelect,
}) {
  const trueMatchedAIndex = Object.values(priorityDataA).indexOf(true);
  const trueMatchedBIndex = Object.values(priorityDataB).indexOf(true);
  let isValid = false;
  if (trueMatchedAIndex === trueMatchedBIndex) {
    // Both have same priority.
    isValid = checkRankIfSamePriority({
      playerBSelect,
      playerASelect,
      priority: trueMatchedAIndex,
    });
  } else if (trueMatchedAIndex > trueMatchedBIndex) {
    isValid = true;
  } else if (
    (trueMatchedAIndex === -1 && trueMatchedBIndex !== -1) ||
    (trueMatchedBIndex === -1 && trueMatchedAIndex !== -1)
  ) {
    isValid = true;
  } else {
    isValid = false;
  }
  return isValid;
}

export function getCoditionOfPlayerBAtStep5({
  playerDataA,
  playerDataB,
  playerBSelect,
  playerASelect = [],
}) {
  const { data: priorityDataA } = playerDataA;
  const { cards } = playerDataB;
  const currentPlayerB =
    playerBSelect?.filter((key, index) => index !== 2) || [];

  const currentCard = currentPlayerB.map((key) =>
    cards.find(({ value }) => value === key)
  );
  const allCards = generateCardsData();
  const allCardsDeduceData = allCards
    .flatMap((typeData) => typeData)
    .reduce(
      (acc, cardAllData) => {
        if (
          ![...playerASelect, ...currentPlayerB].includes(cardAllData.value)
        ) {
          const priorityWiseData = generateWinningConditionsArray({
            currentCard: [...currentCard, cardAllData],
          });
          if (
            Object.values(priorityWiseData).some((values) => values) &&
            Object.values(priorityDataA).some((values) => values)
          ) {
            // The priority says true, but is it valid ?
            if (
              isCurrentCardAValidAfterPriority({
                priorityDataA,
                priorityDataB: priorityWiseData,
                playerBSelect: [...currentCard, cardAllData],
                playerASelect: playerDataA.cards,
              })
            ) {
              acc.pass++;
              acc.data[`${cardAllData.value}`] = priorityWiseData;
            } else {
              acc.fail++;
            }
          } else {
            // Check for high card if all are false for Player B.
            if (
              checkIfHighCard({
                priorityDataA,
                priorityDataB: priorityWiseData,
                playerBSelect: [...currentCard, cardAllData],
                playerASelect: playerDataA.cards,
              })
            ) {
              acc.pass++;
              acc.data[`${cardAllData.value}`] = {
                ...priorityWiseData,
                isHighCard: true,
              };
            } else {
              acc.fail++;
            }
          }
          acc.count++;
          acc.allCriteriaPlayerB[
            [...currentCard, cardAllData].map(({ value }) => value).join(",")
          ] = priorityWiseData;
        }
        return acc;
      },
      {
        data: {},
        pass: 0,
        fail: 0,
        count: 0,
        allCriteriaPlayerB: {},
      }
    );

  const { data, ...rest } = allCardsDeduceData;
  let priortyWiseHit = {
    currentPriorty: {},
    prediction: { ...rest, playerACriteria: priorityDataA },
  };
  const dataForColumns = Object.entries(data).map(([key, value]) => {
    const trueMatchedIndex = Object.values(value).indexOf(true);
    const priority = Object.keys(value)[trueMatchedIndex];
    if (!priortyWiseHit.currentPriorty[priority])
      priortyWiseHit.currentPriorty[priority] = {
        count: 0,
        data: [],
      };
    priortyWiseHit.currentPriorty[priority].count += 1;
    priortyWiseHit.currentPriorty[priority].data.push(key);
    return {
      name: key,
      priority,
      sortIndex: trueMatchedIndex,
      result: "Yes",
    };
  });

  return {
    priortyWiseHit,
    dataForColumns: dataForColumns.sort(sortViaSortIndex),
  };
}

export function getPredictionData({ priortyWiseHit }) {
  const {
    currentPriorty,
    prediction: { count },
  } = priortyWiseHit;
  return Object.entries(currentPriorty).reduce(
    (acc, [key, value]) => {
      acc.keyArray.push(key);
      acc.countArray.push(value.count);
      acc.pieChartData.push({
        type: key,
        value: Math.round((value.count / count) * 100),
      });
      return acc;
    },
    {
      keyArray: [],
      countArray: [],
      pieChartData: [],
      playerAWinPercentage: 0.1,
      playerBWinPercentage: 0.2,
    }
  );
}

export function generateCardsDataAutomation() {
  const allCardData = generateCardsData();
  const automationObj = {
    allData: {},
    matchedData: [],
    unMatchedData: [],
  };
  const priorityWiseData = {};
  const analyticsData = {
    total: 0,
    pass: 0,
    fail: 0,
  };

  function getThreeCardCombinations(arr) {
    const result = [];

    for (let i = 0; i < arr.length - 2; i++) {
      for (let j = i + 1; j < arr.length - 1; j++) {
        for (let k = j + 1; k < arr.length; k++) {
          result.push([arr[i], arr[j], arr[k]]);
        }
      }
    }

    return result;
  }

  const mergedCardData = getThreeCardCombinations(
    allCardData.flatMap((typeData) => typeData)
  );

  let deduceData2 = [];
  mergedCardData.forEach((threeCardData) => {
    const updatedData = threeCardData.sort(sortViaSortIndex).reduce(
      (acc, { type, sortIndex, rank, label }) => {
        acc["typeArray"].push(type);
        acc["sortIndexArray"].push(sortIndex);
        acc["rankArray"].push(rank);
        acc["nameArray"].push(label);
        return acc;
      },
      {
        typeArray: [],
        sortIndexArray: [],
        rankArray: [],
        nameArray: [],
      }
    );
    updatedData.specialSortIndexArray = threeCardData
      .sort(sortViaSpecialSortIndex)
      .map(({ specialSortIndex }) => specialSortIndex);
    updatedData.royalSortIndexArray = threeCardData
      .sort(sortViaRoyalSortIndex)
      .map(({ royalSortIndex }) => royalSortIndex);
    deduceData2.push(updatedData);
  });

  deduceData2.forEach((data) => {
    const {
      typeArray,
      rankArray,
      specialSortIndexArray,
      sortIndexArray,
      royalSortIndexArray,
      nameArray,
    } = data;
    const priorityObj = {
      isRoyalFlush: checkIfRoyalFlush({ typeArray, specialSortIndexArray }),
      isStraightFlush: checkIfStraightFlush({ typeArray, sortIndexArray }),
      isThreeOfKind: checkIfThreeOfAKind({ rankArray }),
      isStraight: checkIfStraight({ typeArray, royalSortIndexArray }),
      isFlush:
        !checkIfRoyalFlush({ typeArray, specialSortIndexArray }) &&
        checkIfFlush({ typeArray, sortIndexArray }),
      isPair: checkIfPair({ rankArray }),
    };

    automationObj.allData[nameArray.join(",")] = {
      ...priorityObj,
    };

    const resultTrueIndex = Object.values(priorityObj)
      .map((values) => values)
      .indexOf(true);
    analyticsData.total++;
    if (resultTrueIndex !== -1) {
      const priorityName = Object.keys(priorityObj).map((values) => values)[
        resultTrueIndex
      ];
      if (!priorityWiseData[priorityName])
        priorityWiseData[priorityName] = {
          matchedArray: [],
          count: 0,
        };
      automationObj.matchedData.push({
        ...data,
        priority: resultTrueIndex,
        priorityName,
      });
      priorityWiseData[priorityName].matchedArray.push(data);
      priorityWiseData[priorityName].count++;
      analyticsData.pass++;
    } else {
      // No card is valid, hence it is an high card.
      analyticsData.fail++;
      automationObj.unMatchedData.push(data);
    }
  });

  automationObj.matchedData = automationObj.matchedData.sort(
    (a, b) => a.priority - b.priority
  );

  return { automationObj, priorityWiseData, analyticsData };
}
