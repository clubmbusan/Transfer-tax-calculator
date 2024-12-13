document.addEventListener('DOMContentLoaded', () => {
    const propertyTypeSelect = document.getElementById('propertyType');
    const regulatedAreaField = document.getElementById('regulatedAreaField');
    const singleHouseExemptionField = document.getElementById('singleHouseExemptionField');
    const acquisitionDateInput = document.getElementById('acquisitionDate');
    const transferDateInput = document.getElementById('transferDate');
    const holdingYearsDisplay = document.getElementById('holdingYearsDisplay');
    const calculateButton = document.getElementById('calculateButton');

    // 숫자 입력에 콤마 추가
    document.addEventListener('input', (event) => {
        const target = event.target;
        if (['acquisitionPrice', 'transferPrice', 'expenses'].includes(target.id)) {
            const rawValue = target.value.replace(/[^0-9]/g, '');
            target.value = rawValue ? parseInt(rawValue, 10).toLocaleString() : '';
        }
    });

    // 부동산 유형에 따라 필드 표시/숨김
    const updateFieldsByPropertyType = () => {
        const propertyType = propertyTypeSelect.value;

        if (propertyType === 'house') {
            // 주택: 관련 필드 표시
            regulatedAreaField.style.display = 'block';
            singleHouseExemptionField.style.display = 'block';
        } else if (propertyType === 'commercial' || propertyType === 'landForest') {
            // 상업용 부동산 및 토지/임야: 관련 필드 숨김
            regulatedAreaField.style.display = 'none';
            singleHouseExemptionField.style.display = 'none';
        }
    };

    // 초기화 및 이벤트 연결
    propertyTypeSelect.addEventListener('change', updateFieldsByPropertyType);
    updateFieldsByPropertyType(); // 초기 상태 설정

    // 보유 기간 자동 계산
    const calculateHoldingYears = () => {
        const acquisitionDate = new Date(acquisitionDateInput.value);
        const transferDate = new Date(transferDateInput.value);

        if (isNaN(acquisitionDate) || isNaN(transferDate)) {
            holdingYearsDisplay.value = '날짜를 입력하세요.';
            return;
        }

        const diffInMilliseconds = transferDate - acquisitionDate;
        const diffInYears = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365); // 1년 단위로 계산
        holdingYearsDisplay.value = diffInYears.toFixed(2) + '년';
    };

    acquisitionDateInput.addEventListener('change', calculateHoldingYears);
    transferDateInput.addEventListener('change', calculateHoldingYears);

    // 계산 버튼 클릭 이벤트
    calculateButton.addEventListener('click', () => {
        const propertyType = propertyTypeSelect.value;
        const regulatedArea = document.getElementById('regulatedArea').value === 'yes';
        const singleHouseExemption = document.getElementById('singleHouseExemption').value === 'yes';
        const acquisitionPrice = parseInt(document.getElementById('acquisitionPrice').value.replace(/,/g, '') || '0', 10);
        const transferPrice = parseInt(document.getElementById('transferPrice').value.replace(/,/g, '') || '0', 10);
        const expenses = parseInt(document.getElementById('expenses').value.replace(/,/g, '') || '0', 10);
        const holdingYears = parseFloat(holdingYearsDisplay.value) || 0;

        // 양도차익 계산
        const profit = transferPrice - acquisitionPrice - expenses;

        // 비과세 판단
        if (singleHouseExemption && propertyType === 'house' && transferPrice <= 1200000000) {
            document.getElementById('result').innerHTML = `<p>1세대 1주택 비과세 조건 충족으로 세금이 없습니다.</p>`;
            return;
        }

        // 기본 세율 및 중과세
        let taxRate = 0;
        let surcharge = 0;
        if (propertyType === 'house') {
            taxRate = regulatedArea ? 0.2 : 0.1; // 기본 세율
            surcharge = regulatedArea ? 0.1 : 0; // 조정대상지역 중과세
        } else if (propertyType === 'land' || propertyType === 'forest') {
            taxRate = 0.15;
        } else if (propertyType === 'commercial') {
            taxRate = 0.2;
        }

        // 장기보유특별공제
        const longTermDeductionRate = propertyType === 'house' ? Math.min(holdingYears * 0.04, 0.4) : Math.min(holdingYears * 0.03, 0.3);
        const taxableProfit = profit * (1 - longTermDeductionRate);

        // 양도소득세 계산
        const tax = Math.floor(taxableProfit * taxRate + taxableProfit * surcharge);

        // 부가세 계산
        const educationTax = Math.floor(tax * 0.1); // 지방교육세
        const ruralTax = Math.floor(tax * 0.2); // 농어촌특별세
        const totalTax = tax + educationTax + ruralTax;

        // 결과 출력
        document.getElementById('result').innerHTML = `
            <h3>계산 결과</h3>
            <p>보유 기간: ${holdingYears.toFixed(2)} 년</p>
            <p>양도차익: ${profit.toLocaleString()} 원</p>
            <p>장기보유특별공제: ${(longTermDeductionRate * 100).toFixed(1)}%</p>
            <p>과세표준: ${taxableProfit.toLocaleString()} 원</p>
            <p>양도소득세: ${tax.toLocaleString()} 원</p>
            <p>지방교육세: ${educationTax.toLocaleString()} 원</p>
            <p>농어촌특별세: ${ruralTax.toLocaleString()} 원</p>
            <p><strong>총 세금: ${totalTax.toLocaleString()} 원</strong></p>
        `;
    });
});
