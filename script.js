document.addEventListener('DOMContentLoaded', () => {
    const calculateButton = document.getElementById('calculateButton');

    // 숫자 입력에 콤마 추가
    document.addEventListener('input', (event) => {
        const target = event.target;
        if (['acquisitionPrice', 'transferPrice', 'expenses'].includes(target.id)) {
            const rawValue = target.value.replace(/[^0-9]/g, '');
            target.value = rawValue ? parseInt(rawValue, 10).toLocaleString() : '';
        }
    });

    // 계산 버튼 클릭 이벤트
    calculateButton.addEventListener('click', () => {
        // 입력 값 가져오기
        const acquisitionPrice = parseInt(document.getElementById('acquisitionPrice').value.replace(/,/g, '') || '0', 10);
        const transferPrice = parseInt(document.getElementById('transferPrice').value.replace(/,/g, '') || '0', 10);
        const expenses = parseInt(document.getElementById('expenses').value.replace(/,/g, '') || '0', 10);
        const holdingYears = parseInt(document.getElementById('holdingYears').value || '0', 10);

        // 양도차익 계산
        const profit = transferPrice - acquisitionPrice - expenses;
        if (profit <= 0) {
            document.getElementById('result').innerHTML = `<p>양도차익이 없거나 손실입니다.</p>`;
            return;
        }

        // 장기보유특별공제 적용
        const longTermDeductionRate = Math.min(holdingYears * 0.06, 0.4); // 최대 40% 공제
        const taxableProfit = profit * (1 - longTermDeductionRate);

        // 양도소득세 계산
        const taxBrackets = [
            { limit: 12000000, rate: 0.06, deduction: 0 },
            { limit: 46000000, rate: 0.15, deduction: 1080000 },
            { limit: 88000000, rate: 0.24, deduction: 5220000 },
            { limit: 150000000, rate: 0.35, deduction: 14900000 },
            { limit: 300000000, rate: 0.38, deduction: 19400000 },
            { limit: 500000000, rate: 0.40, deduction: 25400000 },
            { limit: Infinity, rate: 0.42, deduction: 35400000 },
        ];

        let tax = 0;
        for (const bracket of taxBrackets) {
            if (taxableProfit > bracket.limit) {
                tax += (bracket.limit - (taxBrackets[0].limit || 0)) * bracket.rate;
            } else {
                tax += (taxableProfit - (bracket.limit || 0)) * bracket.rate - bracket.deduction;
                break;
            }
        }
        tax = Math.max(0, tax);

        // 부가세 계산
        const educationTax = Math.floor(tax * 0.1); // 지방교육세
        const ruralTax = Math.floor(tax * 0.2); // 농어촌특별세
        const totalTax = tax + educationTax + ruralTax;

        // 결과 출력
        document.getElementById('result').innerHTML = `
            <h3>계산 결과</h3>
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
