document.addEventListener('DOMContentLoaded', () => {
    const domainInput = document.getElementById('domainInput');
    const lookupButton = document.getElementById('lookupButton');
    const resultsDiv = document.getElementById('results');

    lookupButton.addEventListener('click', performDnsLookup);
    domainInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performDnsLookup();
        }
    });

    async function performDnsLookup() {
        const domain = domainInput.value.trim();
        if (!domain) {
            displayResult('<p class="error">请输入一个域名。</p>');
            return;
        }

        resultsDiv.innerHTML = '<p class="loading">正在查询 DNS 记录...</p>';

        try {
            // 使用 Google DNS over HTTPS API
            const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
            const data = await response.json();

            let output = `<h2>${domain} 的 DNS 记录:</h2>`;

            if (data.Answer && data.Answer.length > 0) {
                output += '<table class="dns-table">';
                output += '<thead><tr><th>类型</th><th>TTL</th><th>数据</th></tr></thead>';
                output += '<tbody>';
                data.Answer.forEach(record => {
                    output += `<tr><td>${record.type} (A)</td><td>${record.TTL} 秒</td><td>${record.data}</td></tr>`;
                });
                output += '</tbody></table>';
            } else if (data.Authority && data.Authority.length > 0) {
                output += `<p>未找到 A 记录，但找到了权威名称服务器：</p>`;
                output += '<table class="dns-table">';
                output += '<thead><tr><th>类型</th><th>TTL</th><th>数据</th></tr></thead>';
                output += '<tbody>';
                data.Authority.forEach(record => {
                    output += `<tr><td>${record.type}</td><td>${record.TTL} 秒</td><td>${record.data}</td></tr>`;
                });
                output += '</tbody></table>';
            } else {
                output += '<p>未找到任何 DNS 记录。</p>';
            }
            displayResult(output);

        } catch (error) {
            console.error('DNS 查询失败:', error);
            displayResult('<p class="error">查询失败，请检查域名或稍后再试。</p>');
        }
    }

    function displayResult(htmlContent) {
        resultsDiv.innerHTML = htmlContent;
    }
});