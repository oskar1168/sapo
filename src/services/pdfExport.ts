import { ActivityItem, ShoppingItem } from '../types/travelData';

type TripStats = {
  totalPlaces: number;
  totalBudgetKRW: number;
  shoppingTotalCostKRW: number;
  nights: string;
};

const categoryLabels: Record<string, string> = {
  flight: '항공',
  checkin: '체크인',
  food: '식사',
  meal: '식사',
  cafe: '카페',
  sightseeing: '관광',
  spot: '스팟',
  shopping: '쇼핑',
  lodging: '숙소',
  transport: '교통',
  etc: '기타',
};

const shoppingCategoryLabels: Record<string, string> = {
  Dessert: '디저트',
  dessert: '디저트',
  Drug: '드럭스토어',
  drug: '드럭스토어',
  Drink: '주류/음료',
  alcohol: '주류/음료',
  Gift: '기념품',
  souvenir: '기념품',
  Item: '일반',
  etc: '기타',
};

const escapeHTML = (str: string) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatNumber = (num: number) => Math.round(num).toLocaleString();

const getSortedDayKeys = (travelData: any) => {
  return Object.keys(travelData.days || {}).sort((a, b) => {
    return parseInt(a.replace('day', '')) - parseInt(b.replace('day', ''));
  });
};

const getDayDateString = (travelData: any, dayIndex: string) => {
  const start = new Date(travelData.startDate);
  const dayOffset = parseInt(dayIndex) - 1;
  start.setDate(start.getDate() + dayOffset);
  const mm = String(start.getMonth() + 1).padStart(2, '0');
  const dd = String(start.getDate()).padStart(2, '0');
  const dayName = start.toLocaleDateString('ko-KR', { weekday: 'short' });
  return `${mm}.${dd}(${dayName})`;
};

const baseStyleHtml = `
  <style>
    body {
      margin: 0;
      padding: 20px;
      background-color: #f8fafc;
    }
    .pdf-export-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #2c3e50;
      background: #ffffff;
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
      padding: 40px;
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th, td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      font-size: 0.85rem;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 800;
    }
    * {
      box-shadow: none !important;
      text-shadow: none !important;
    }
  </style>
`;

export const generateScheduleHtml = (travelData: any, exchangeRate: number) => {
  const dayKeys = getSortedDayKeys(travelData);
  const tripTitle = travelData.title || '나의 여행 계획';
  const tripDates = `${travelData.startDate} ~ ${travelData.endDate}`;
  const totalDays = dayKeys.length;
  const nights = totalDays > 1 ? `${totalDays - 1}박 ${totalDays}일` : '당일 일정';
  const memberText = `${travelData.memberCount || 1}명`;

  const contentHtml = dayKeys.map((dayKey) => {
    const items = travelData.days[dayKey] || [];
    if (items.length === 0) return '';

    const dayIndex = dayKey.replace('day', '');
    const dateStr = getDayDateString(travelData, dayIndex);
    const sortedItems = [...items].sort((a: ActivityItem, b: ActivityItem) => a.time.localeCompare(b.time));

    const itemHtml = sortedItems.map((item: ActivityItem) => {
      const catLabel = categoryLabels[item.type] || categoryLabels[item.type || ''] || '기타';
      const costText = item.cost && item.cost > 0
        ? (item.currency === 'JPY'
            ? `¥ ${formatNumber(item.cost)} (약 ${formatNumber(item.cost * exchangeRate)}원)`
            : `${formatNumber(item.cost)}원`)
        : '비용 없음/무료';

      return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; background: #fdfdfd; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; page-break-inside: avoid; box-sizing: border-box;">
          <tr>
            <td style="width: 62px; padding: 12px; vertical-align: top;">
              <div style="width: 62px; background: rgba(108, 92, 231, 0.08); border-radius: 8px; padding: 6px 4px; text-align: center; box-sizing: border-box;">
                <span style="font-size: 0.75rem; font-weight: 800; color: #6c5ce7; line-height: 1.2; display: block;">${escapeHTML(item.time)}</span>
                <span style="font-size: 0.62rem; color: #7f8c8d; font-weight: 700; margin-top: 2px; display: block;">${escapeHTML(catLabel)}</span>
              </div>
            </td>
            <td style="padding: 12px 16px 12px 6px; vertical-align: top; text-align: left;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
                <tr>
                  <td style="text-align: left; vertical-align: top; border-bottom: 0;">
                    <h3 style="font-size: 1rem; font-weight: 700; color: #2c3e50; margin: 0; padding: 0;">${escapeHTML(item.name)}</h3>
                  </td>
                  <td style="text-align: right; vertical-align: top; width: 200px; padding-left: 10px; border-bottom: 0;">
                    <span style="font-size: 0.78rem; color: #2ecc71; font-weight: 700; white-space: nowrap;">${costText}</span>
                  </td>
                </tr>
                ${item.memo ? `
                <tr>
                  <td colspan="2" style="padding-top: 6px; border-bottom: 0;">
                    <p style="font-size: 0.8rem; color: #7f8c8d; margin: 0; white-space: pre-line; background: rgba(0,0,0,0.01); padding: 6px 10px; border-radius: 6px; border-left: 3px solid rgba(108, 92, 231, 0.4); line-height: 1.4; text-align: left;">${escapeHTML(item.memo)}</p>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
        </table>
      `;
    }).join('');

    return `
      <div style="margin-top: 28px; margin-bottom: 14px; border-bottom: 1.5px solid rgba(108, 92, 231, 0.25); padding-bottom: 6px; text-align: left; width: 100%;">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: #6c5ce7; margin: 0;">Day ${dayIndex} <span style="font-size: 0.9rem; font-weight: 600; color: #7f8c8d; margin-left: 6px;">(${dateStr})</span></h2>
      </div>
      ${itemHtml}
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${baseStyleHtml}
    </head>
    <body>
      <div class="pdf-export-container">
        <div style="border-bottom: 3px solid #6c5ce7; padding-bottom: 16px; margin-bottom: 24px; text-align: center; width: 100%;">
          <h1 style="font-size: 1.8rem; font-weight: 800; color: #2c3e50; margin: 0 0 8px 0;">${escapeHTML(tripTitle)}</h1>
          <p style="font-size: 0.95rem; color: #7f8c8d; font-weight: 600; margin: 0;">여행 기간: ${tripDates} (${nights}) | 여행 인원: ${memberText}</p>
        </div>
        ${contentHtml}
      </div>
    </body>
    </html>
  `;
};

export const generateBudgetHtml = (travelData: any, _stats: TripStats, exchangeRate: number) => {
  const tripTitle = travelData.title || '나의 여행 계획';
  const tripDates = `${travelData.startDate} ~ ${travelData.endDate}`;
  const dayKeys = getSortedDayKeys(travelData);
  const totalDays = dayKeys.length;
  const nights = totalDays > 1 ? `${totalDays - 1}박 ${totalDays}일` : '당일 일정';

  const jointDetailedList: { name: string; categoryName: string; costText: string; totalKRW: number }[] = [];
  let jointCostKRW = 0;

  dayKeys.forEach((dayKey) => {
    const items = travelData.days[dayKey] || [];
    items.forEach((item: ActivityItem) => {
      if (item.cost && item.cost > 0) {
        const itemCostKRW = item.currency === 'JPY' ? Math.round(item.cost * exchangeRate) : item.cost;
        jointCostKRW += itemCostKRW;
        jointDetailedList.push({
          name: item.name,
          categoryName: categoryLabels[item.type] || '기타',
          costText: item.currency === 'JPY' ? `¥ ${formatNumber(item.cost)}` : `${formatNumber(item.cost)}원`,
          totalKRW: itemCostKRW,
        });
      }
    });
  });

  const personalShoppingList: { name: string; categoryName: string; costPerUnit: string; qtyText: string; totalKRW: number }[] = [];
  let personalShoppingCostKRW = 0;

  (travelData.shoppingList || []).forEach((item: ShoppingItem) => {
    if (item.checked) {
      const itemTotalCost = item.cost * item.qty;
      const itemTotalKRW = item.currency === 'JPY' ? Math.round(itemTotalCost * exchangeRate) : itemTotalCost;
      personalShoppingCostKRW += itemTotalKRW;
      personalShoppingList.push({
        name: item.name,
        categoryName: shoppingCategoryLabels[item.category] || '기타',
        costPerUnit: item.currency === 'JPY' ? `¥ ${formatNumber(item.cost)}` : `${formatNumber(item.cost)}원`,
        qtyText: `${item.qty}개`,
        totalKRW: itemTotalKRW,
      });
    }
  });

  const jointTableRows = jointDetailedList.length > 0
    ? jointDetailedList.map((item, idx) => `
        <tr style="background-color: ${idx % 2 === 1 ? '#fafafa' : '#ffffff'};">
          <td style="font-weight: 600;">${escapeHTML(item.name)}</td>
          <td style="color: #7f8c8d;">${escapeHTML(item.categoryName)}</td>
          <td style="text-align: right; font-weight: 700;">${item.costText}</td>
          <td style="text-align: right; font-weight: 800; color: #27ae60;">${formatNumber(item.totalKRW)}원</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" style="text-align: center; color: #94a3b8;">등록된 공동 경비가 없습니다.</td></tr>';

  const personalTableRows = personalShoppingList.length > 0
    ? personalShoppingList.map((item, idx) => `
        <tr style="background-color: ${idx % 2 === 1 ? '#fafafa' : '#ffffff'};">
          <td style="font-weight: 600;">${escapeHTML(item.name)}</td>
          <td style="color: #7f8c8d;">${escapeHTML(item.categoryName)}</td>
          <td style="text-align: right; font-weight: 700;">${item.costPerUnit}</td>
          <td style="text-align: right; color: #7f8c8d;">${item.qtyText}</td>
          <td style="text-align: right; font-weight: 800; color: #d35400;">${formatNumber(item.totalKRW)}원</td>
        </tr>
      `).join('')
    : '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">체크된 개인 쇼핑 항목이 없습니다.</td></tr>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${baseStyleHtml}
    </head>
    <body>
      <div class="pdf-export-container">
        <div style="border-bottom: 3px solid #6c5ce7; padding-bottom: 16px; margin-bottom: 24px; text-align: center; width: 100%;">
          <h1 style="font-size: 1.8rem; font-weight: 800; color: #2c3e50; margin: 0 0 8px 0;">${escapeHTML(tripTitle)} 예산 보고서</h1>
          <p style="font-size: 0.95rem; color: #7f8c8d; font-weight: 600; margin: 0;">여행 기간: ${tripDates} (${nights}) | 인원: ${travelData.memberCount || 1}명</p>
        </div>

        <h3 style="font-size: 1.1rem; font-weight: 800; color: #6c5ce7; margin: 0 0 10px 0;">공동 여행 경비 내역</h3>
        <table>
          <thead>
            <tr>
              <th>항목</th>
              <th style="width: 130px;">분류</th>
              <th style="width: 120px; text-align: right;">원 금액</th>
              <th style="width: 140px; text-align: right;">환산 금액(KRW)</th>
            </tr>
          </thead>
          <tbody>
            ${jointTableRows}
            <tr style="background: rgba(46, 204, 113, 0.04); font-weight: 800;">
              <td colspan="3">공동 경비 합계</td>
              <td style="text-align: right; color: #27ae60; font-size: 0.95rem; font-weight: 900;">${formatNumber(jointCostKRW)}원</td>
            </tr>
          </tbody>
        </table>

        <h3 style="font-size: 1.1rem; font-weight: 800; color: #e17055; margin: 24px 0 10px 0;">개인 쇼핑 지출 내역</h3>
        <table>
          <thead>
            <tr>
              <th>쇼핑 항목</th>
              <th style="width: 130px;">분류</th>
              <th style="width: 100px; text-align: right;">단가</th>
              <th style="width: 70px; text-align: right;">수량</th>
              <th style="width: 140px; text-align: right;">총 지출 금액</th>
            </tr>
          </thead>
          <tbody>
            ${personalTableRows}
            <tr style="background: rgba(225, 112, 85, 0.04); font-weight: 800;">
              <td colspan="4">개인 소비 합계</td>
              <td style="text-align: right; color: #e17055; font-size: 0.95rem; font-weight: 900;">${formatNumber(personalShoppingCostKRW)}원</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 12px;">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0 0 10px 0;">정산 요약</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600; color: #475569;">총 공동 경비:</span>
            <span style="font-weight: 800; color: #6c5ce7;">${formatNumber(jointCostKRW)}원</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600; color: #475569;">정산 인원:</span>
            <span style="font-weight: 800; color: #2c3e50;">${travelData.memberCount || 1}명</span>
          </div>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 12px 0;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: 800; color: #2c3e50; font-size: 1.05rem;">1인당 공동 경비:</span>
            <span style="font-weight: 900; color: #2ecc71; font-size: 1.3rem;">${formatNumber(Math.round(jointCostKRW / (travelData.memberCount || 1)))}원</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
