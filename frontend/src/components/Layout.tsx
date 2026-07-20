import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { logoutUser } from '../store/authSlice';
import { notificationApi } from '../api/rentalApi';
import type { Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const getBotResponse = (input: string): string => {
  const text = input.trim().toLowerCase();

  // 1. Check Greetings, Farewells, and Thank Yous
  if (text.match(/\b(?:chào|hello|hi|alo|helo)\b/)) {
    return `**Xin chào!** Tôi là Trợ lý AI của Stall Rental.\n\nTôi có thể tư vấn giúp bạn chọn khu vực phù hợp, ngân sách thuê và mặt hàng kinh doanh lý tưởng tại trung tâm.\n\nHãy nhập thông tin như **Ngân sách thuê mong muốn** (ví dụ: *5 triệu, 12tr, 500k*) hoặc **Ngành hàng** bạn muốn bán (ví dụ: *quần áo, cafe, trà sữa, đồ chơi*) để tôi phân tích nhé!`;
  }
  if (text.match(/\b(?:cảm ơn|cám ơn|thank|tks|thanks)\b/)) {
    return `**Dạ không có gì ạ!** Rất vui được hỗ trợ bạn. Chúc bạn tìm được gian hàng lý tưởng và kinh doanh hồng phát, gặp nhiều may mắn! Nếu cần thêm thông tin gì khác, cứ nhắn cho tôi nhé!`;
  }
  if (text.match(/\b(?:tạm biệt|bye|g9|tạm biy|hẹn gặp lại)\b/)) {
    return `**Tạm biệt bạn!** Chúc bạn một ngày tốt lành và tràn đầy năng lượng. Hẹn gặp lại bạn lần sau!`;
  }

  // 2. Classify Business Types
  const isFood = text.includes('ăn') || text.includes('uống') || text.includes('ẩm thực') || text.includes('nhà hàng') || text.includes('cafe') || text.includes('cà phê') || text.includes('trà sữa') || text.includes('bánh') || text.includes('lẩu') || text.includes('nướng') || text.includes('kem') || text.includes('nước') || text.includes('sinh tố') || text.includes('quán ăn');
  const isFashion = text.includes('thời trang') || text.includes('quần áo') || text.includes('váy') || text.includes('giày') || text.includes('dép') || text.includes('mỹ phẩm') || text.includes('son') || text.includes('trang sức') || text.includes('vàng') || text.includes('bạc') || text.includes('nhẫn') || text.includes('vòng') || text.includes('túi xách') || text.includes('phụ kiện thời trang');
  const isTech = text.includes('điện thoại') || text.includes('máy tính') || text.includes('điện tử') || text.includes('công nghệ') || text.includes('gia dụng') || text.includes('sách') || text.includes('đồ chơi') || text.includes('linh kiện') || text.includes('thiết bị') || text.includes('nhà sách') || text.includes('văn phòng phẩm');

  // 3. Robust Budget Extraction (in Millions VND)
  let budget: number | null = null;
  
  // Format: 500k, 800k, 1200k
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/);
  if (kMatch) {
    budget = Number(kMatch[1]) / 1000;
  }
  
  // Format: 5tr, 5 triệu, 5 trieu, 5trđ
  const trMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:triệu|tr|trieu)\b/);
  if (trMatch) {
    budget = Number(trMatch[1]);
  }
  
  // Format: 15,000,000 or 15.000.000 or 15000000
  if (!budget) {
    const cleanText = text.replace(/[,.]/g, ''); // Remove separators
    const numMatch = cleanText.match(/\b(\d{6,9})\b/);
    if (numMatch) {
      budget = Number(numMatch[1]) / 1000000;
    }
  }

  // Fallback for raw numbers (e.g. "tài chính 10", "tầm 15")
  if (!budget) {
    const smallNumMatch = text.match(/\b(\d{1,2})\b/);
    if (smallNumMatch) {
      const val = Number(smallNumMatch[1]);
      // Exclude numbers that refer to specific zones (A, B, C, D) or dates/months
      if (val >= 3 && val <= 100 && !text.includes('khu ' + val) && !text.includes('tầng ' + val)) {
        budget = val;
      }
    }
  }

  // 4. Branching on Context
  
  // A. BOTH Category and Budget specified
  if ((isFood || isFashion || isTech) && budget !== null) {
    if (isFood) {
      if (budget < 5) {
        return `Với ngành **Ẩm thực & Đồ uống** và ngân sách **dưới 5 triệu/tháng** (~${budget} triệu), tôi khuyên bạn nên chọn **Khu D - Ngoài Trời**:\n\n* **Gợi ý gian hàng:** GH-D01 (Kiosk Kem Tràng Tiền) hoặc GH-D02 (Bánh tráng nướng Đà Lạt) với giá chỉ khoảng 3.0M - 3.5M VND/tháng.\n* **Ưu điểm:** Vị trí ngoài trời thoáng mát, đông đúc khách vãng lai, cực kỳ lý tưởng cho các kiosk thức ăn đường phố, giải khát di động, hoặc xiên que.`;
      } else if (budget <= 15) {
        return `Với ngành **Ẩm thực & Đồ uống** và ngân sách **5M - 15M/tháng** (~${budget} triệu), lựa chọn hoàn hảo của bạn là **Khu B - Tầng 1 (Khu Ẩm thực)**:\n\n* **Gợi ý gian hàng:** GH-B02 (Quầy trà sữa Gong Cha - 7 triệu/tháng) hoặc GH-B04 (Quầy Bánh mì Minh Nhật - 5 triệu/tháng).\n* **Ưu điểm:** Nằm trong khu máy lạnh tầng 1, tập trung sảnh ăn uống chung của trung tâm, lượng khách ổn định, đã thiết kế sẵn khu vực cấp thoát nước tiện lợi.`;
      } else {
        return `Với ngành **Ẩm thực & Đồ uống** và ngân sách lớn **trên 15 triệu/tháng** (~${budget} triệu), bạn có thể thuê các mặt bằng nhà hàng ẩm thực lớn tại **Khu B - Tầng 1**:\n\n* **Gợi ý gian hàng:** GH-B01 (Nhà hàng lẩu băng chuyền Kichi Kichi - 25 triệu/tháng) hoặc GH-B05 (Quầy gà rán KFC - 22 triệu/tháng).\n* **Ưu điểm:** Diện tích rộng rãi từ 60m² - 80m², vị trí mặt tiền sảnh ẩm thực đông đúc, đã trang bị đầy đủ hệ thống hút mùi công nghiệp và bếp lớn chuyên dụng.`;
      }
    }

    if (isFashion) {
      if (budget < 6) {
        return `Bạn muốn kinh doanh **Thời trang/Mỹ phẩm** với ngân sách **dưới 6 triệu/tháng** (~${budget} triệu).\n\n* **Lời khuyên:** Các gian hàng thời trang máy lạnh ở Khu A có giá tối thiểu từ 6 triệu/tháng. \n* **Giải pháp:** Bạn có thể chuyển sang thuê các kiosk hoặc xe đẩy phụ kiện thời trang di động ngoài trời tại **Khu D** (Giá từ 3 - 4 triệu/tháng) để tối ưu chi phí khởi nghiệp.`;
      } else if (budget <= 10) {
        return `Với ngành **Thời trang/Mỹ phẩm/Trang sức** và ngân sách **6M - 10M/tháng** (~${budget} triệu), bạn nên chọn các gian hàng tại **Khu A - Tầng Trệt (Khu thời trang cao cấp)**:\n\n* **Gợi ý gian hàng:** GH-A02 (Mỹ phẩm Shiseido - 6 triệu/tháng), GH-A01 (Thời trang Converse - 8 triệu/tháng) hoặc GH-A03 (Trang sức PNJ - 10 triệu/tháng).\n* **Ưu điểm:** Vị trí đắc địa tại sảnh trệt sầm uất, thiết kế sang trọng, khách hàng dễ dàng tiếp cận ngay khi bước vào trung tâm.`;
      } else {
        return `Với ngành **Thời trang/Mỹ phẩm** và ngân sách lớn **trên 10 triệu/tháng** (~${budget} triệu), bạn nên chọn những mặt bằng thương hiệu lớn tại **Khu A - Tầng Trệt**:\n\n* **Gợi ý gian hàng:** GH-A04 (Adidas Sport - 18 triệu/tháng) hoặc GH-A05 (Nike Outlet - 16 triệu/tháng).\n* **Ưu điểm:** Vị trí đắc địa sát cầu thang cuốn, cực kỳ lý tưởng để thu hút lượng khách mua sắm lớn.`;
      }
    }

    if (isTech) {
      if (budget < 10) {
        return `Với ngành **Gia dụng & Công nghệ** và tài chính **dưới 10 triệu/tháng** (~${budget} triệu), bạn có thể thuê các quầy nhỏ tại **Khu C - Tầng 2**:\n\n* **Gợi ý gian hàng:** GH-C03 (Kiosk phụ kiện Anker - 4.5 triệu/tháng).\n* **Ưu điểm:** Chi phí cực thấp, thiết kế tủ kính trưng bày hiện đại, đặt tại sảnh tầng công nghệ thu hút giới trẻ thích săn phụ kiện điện thoại.`;
      } else {
        return `Với ngành **Gia dụng/Công nghệ/Giải trí** và ngân sách **trên 10 triệu/tháng** (~${budget} triệu), bạn nên chọn mặt bằng rộng rãi ở **Khu C - Tầng 2**:\n\n* **Gợi ý gian hàng:** GH-C01 (Đồ chơi My Kingdom - 12 triệu/tháng), GH-C05 (Đồ gia dụng Lock&Lock - 15 triệu/tháng) hoặc GH-C04 (Nhà sách Fahasa - 20 triệu/tháng).\n* **Ưu điểm:** Mặt bằng siêu rộng từ 50m² - 90m², hướng tới đối tượng khách hàng mua sắm gia đình, phụ huynh và trẻ nhỏ.`;
      }
    }
  }

  // B. ONLY Budget specified (e.g. "Tôi có 10 triệu")
  if (budget !== null) {
    if (budget < 5) {
      return `Với ngân sách **dưới 5 triệu/tháng** (~${budget} triệu), khu vực phù hợp nhất là **Khu D - Ngoài Trời** (giá chỉ từ 3M - 4M VND/tháng).\n\nBạn dự kiến kinh doanh mặt hàng gì tại đây?\n\n* **Ẩm thực đường phố, kem, xiên que.**\n* **Kiosk nước uống mang đi (take-away), cafe.**\n* **Đồ thủ công mỹ nghệ, quà lưu niệm hội chợ.**\n\nHãy cho tôi biết mặt hàng kinh doanh mong muốn của bạn nhé!`;
    } else if (budget <= 15) {
      return `Với ngân sách khoảng **${budget} triệu/tháng**, bạn có rất nhiều lựa chọn tốt ở các khu vực trong nhà:\n\n* **Khu A (Thời trang, Mỹ phẩm):** GH-A01 (8 triệu), GH-A02 (6 triệu), GH-A03 (10 triệu).\n* **Khu B (Khu Ẩm thực):** Quầy Gong Cha GH-B02 (7 triệu).\n* **Khu C (Công nghệ, Đồ chơi):** GH-C03 (4.5 triệu).\n\nHành trình mở cửa hàng của bạn theo hướng nào? (Ví dụ: Thời trang, Ăn uống, hay Đồ điện tử/sách?)`;
    } else {
      return `Với tài chính **trên 15 triệu/tháng** (~${budget} triệu), bạn có thể sở hữu các mặt bằng lớn thương hiệu tại trung tâm:\n\n* **Khu B (Tầng 1 - Ẩm thực):** Thích hợp mở nhà hàng lẩu nướng lớn như Kichi Kichi (GH-B01, 25 triệu) hoặc KFC (GH-B05, 22 triệu).\n* **Khu C (Tầng 2 - Gia dụng/Giải trí):** Thích hợp làm đại lý đồ gia dụng Lock&Lock (GH-C05, 15 triệu) hoặc nhà sách Fahasa (GH-C04, 20 triệu).\n* **Khu A (Tầng Trệt - Thời trang lớn):** Adidas Sport (GH-A04, 18 triệu).\n\nBạn dự định kinh doanh mặt hàng gì để tôi chọn vị trí tối ưu nhất?`;
    }
  }

  // C. ONLY Category specified (e.g. "tư vấn bán quần áo")
  if (isFood) {
    return `Để kinh doanh **Ăn uống, Cafe, Trà sữa**, trung tâm có hai khu vực lý tưởng được quy hoạch:\n\n* **Khu B - Tầng 1 (Khu Ẩm thực):** Gian hàng máy lạnh, tập trung ăn uống, có sẵn hệ thống hút mùi và cấp thoát nước (Giá từ 5M - 25M).\n* **Khu D - Ngoài Trời:** Không khí mở, hoạt náo, chi phí rẻ thích hợp đồ ăn vặt, take-away (Giá từ 3M - 4.5M).\n\nNgân sách thuê mong muốn của bạn là bao nhiêu triệu/tháng để tôi chọn vị trí phù hợp?`;
  }
  if (isFashion) {
    return `Mở cửa hàng **Thời trang, Mỹ phẩm, Trang sức** thì **Khu A - Tầng Trệt** là thiên đường số một để thu hút khách hàng mua sắm cao cấp. Giá thuê dao động từ 6 triệu đến 18 triệu VND/tháng.\n\nNgân sách thuê mong muốn của bạn nằm trong khoảng nào để tôi gợi ý mã gian hàng trống cụ thể?`;
  }
  if (isTech) {
    return `Nếu bạn muốn bán **Công nghệ, Điện tử, Gia dụng, Sách, Đồ chơi trẻ em**, **Khu C - Tầng 2** được quy hoạch chuyên biệt cho ngành hàng này để thu hút lượng khách mua sắm gia đình. Giá thuê ở đây dao động từ 4.5 triệu (kiosk nhỏ) đến 30 triệu VND/tháng.\n\nNgân sách thuê dự kiến của bạn khoảng bao nhiêu triệu/tháng để tôi lọc gian hàng?`;
  }

  // D. Zone specific queries
  if (text.includes('khu a')) {
    return `**Khu A - Tầng Trệt (Khu Thời trang & Mỹ phẩm cao cấp):**\n\n* **Quy hoạch:** Quần áo thời trang, giày dép, mỹ phẩm, trang sức.\n* **Mức giá thuê:** 6 triệu - 18 triệu VND/tháng.\n* **Đặc điểm:** Sảnh chính, mặt tiền sang trọng, khách qua lại đông đúc ngay lối vào chính.`;
  }
  if (text.includes('khu b')) {
    return `**Khu B - Tầng 1 (Khu Ẩm thực & Nhà hàng):**\n\n* **Quy hoạch:** Nhà hàng ăn uống, lẩu nướng, quầy trà sữa, cà phê, tiệm bánh.\n* **Mức giá thuê:** 5 triệu - 25 triệu VND/tháng.\n* **Đặc điểm:** Có sẵn cấp thoát nước, quạt hút mùi công nghiệp, không gian sảnh ngồi ăn chung sạch sẽ.`;
  }
  if (text.includes('khu c')) {
    return `**Khu C - Tầng 2 (Khu Công nghệ & Gia đình):**\n\n* **Quy hoạch:** Siêu thị điện máy mini, đồ gia dụng, đồ chơi trẻ em, nhà sách, văn phòng phẩm.\n* **Mức giá thuê:** 4.5 triệu - 30 triệu VND/tháng.\n* **Đặc điểm:** Mặt bằng diện tích lớn (40m² - 100m²), không gian mua sắm gia đình yên tĩnh, văn minh.`;
  }
  if (text.includes('khu d')) {
    return `**Khu D - Ngoài Trời (Ẩm thực đường phố & Sự kiện):**\n\n* **Quy hoạch:** Kiosk di động, đồ ăn vặt ngoài trời, sinh tố giải khát, xe nướng xiên que.\n* **Mức giá thuê:** 3 triệu - 4.5 triệu VND/tháng.\n* **Đặc điểm:** Chi phí cực rẻ, không khí mở ngoài trời sầm uất buổi tối, phù hợp khởi nghiệp vốn nhỏ.`;
  }

  // E. Fallback
  return `Tôi chưa phân tích được chính xác nhu cầu của bạn. \n\nBạn vui lòng nhập thông tin rõ hơn theo mẫu ví dụ sau để tôi hỗ trợ nhé:\n* *"Tôi có 10 triệu muốn bán quần áo"* hoặc\n* *"Vốn 5 triệu nên kinh doanh ăn uống ở khu nào?"*`;
};

const ChatMessageItem = React.memo(({ text, sender }: { text: string; sender: 'user' | 'bot' }) => {
  const [showThinking, setShowThinking] = useState(false);

  const parsed = React.useMemo(() => {
    let thinking = '';
    let content = text;

    const thinkStart = text.indexOf('[THINK]');
    const thinkEnd = text.indexOf('[/THINK]');

    if (thinkStart !== -1) {
      if (thinkEnd !== -1) {
        thinking = text.substring(thinkStart + 7, thinkEnd);
        content = text.substring(0, thinkStart) + text.substring(thinkEnd + 8);
      } else {
        thinking = text.substring(thinkStart + 7);
        content = text.substring(0, thinkStart);
      }
    }

    return { thinking, content };
  }, [text]);

  const processInlineStyles = (raw: string) => {
    let tokens: { type: 'text' | 'bold' | 'code'; value: string }[] = [{ type: 'text', value: raw }];

    // Bold pass
    let newTokens: typeof tokens = [];
    for (const t of tokens) {
      if (t.type === 'text') {
        let lastIdx = 0;
        let match;
        const regex = /\*\*(.*?)\*\*/g;
        while ((match = regex.exec(t.value)) !== null) {
          if (match.index > lastIdx) {
            newTokens.push({ type: 'text', value: t.value.substring(lastIdx, match.index) });
          }
          newTokens.push({ type: 'bold', value: match[1] });
          lastIdx = regex.lastIndex;
        }
        if (lastIdx < t.value.length) {
          newTokens.push({ type: 'text', value: t.value.substring(lastIdx) });
        }
      } else {
        newTokens.push(t);
      }
    }
    tokens = newTokens;

    // Code/Stall code pass
    newTokens = [];
    for (const t of tokens) {
      if (t.type === 'text') {
        let lastIdx = 0;
        let match;
        const regex = /\b(GH-[A-D]\d{2})\b/g;
        while ((match = regex.exec(t.value)) !== null) {
          if (match.index > lastIdx) {
            newTokens.push({ type: 'text', value: t.value.substring(lastIdx, match.index) });
          }
          newTokens.push({ type: 'code', value: match[1] });
          lastIdx = regex.lastIndex;
        }
        if (lastIdx < t.value.length) {
          newTokens.push({ type: 'text', value: t.value.substring(lastIdx) });
        }
      } else {
        newTokens.push(t);
      }
    }
    tokens = newTokens;

    return tokens.map((t, idx) => {
      if (t.type === 'bold') {
        return <strong key={idx} className="chat-bold">{t.value}</strong>;
      }
      if (t.type === 'code') {
        return <code key={idx} className="chat-booth-pill">{t.value}</code>;
      }
      return t.value;
    });
  };

  const renderContent = (rawText: string) => {
    const lines = rawText.split('\n');
    const blocks: React.ReactNode[] = [];
    let currentTableRows: string[][] = [];
    let currentListItems: string[] = [];
    
    const flushTable = (key: number) => {
      if (currentTableRows.length === 0) return null;
      let headers: string[] = [];
      let rows: string[][] = [];
      
      if (currentTableRows.length > 0) {
        headers = currentTableRows[0];
      }
      
      const startIndex = (currentTableRows.length > 1 && currentTableRows[1].every(cell => cell.trim().match(/^:?-+:?$/) || cell.trim() === '')) ? 2 : 1;
      
      for (let i = startIndex; i < currentTableRows.length; i++) {
        rows.push(currentTableRows[i]);
      }
      
      currentTableRows = [];
      
      return (
        <div className="chat-table-wrapper" key={`table-${key}`}>
          <table className="chat-table">
            <thead>
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx}>{processInlineStyles(h.trim())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx}>{processInlineStyles(cell.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };
    
    const flushList = (key: number) => {
      if (currentListItems.length === 0) return null;
      const items = [...currentListItems];
      currentListItems = [];
      return (
        <ul className="chat-ul" key={`list-${key}`} style={{ margin: '8px 0', paddingLeft: '16px' }}>
          {items.map((item, idx) => (
            <li key={idx} className="chat-li">
              {processInlineStyles(item)}
            </li>
          ))}
        </ul>
      );
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|') && line.includes('|');
      
      if (isTableRow) {
        if (currentListItems.length > 0) {
          blocks.push(flushList(i));
        }
        
        const cols = line.split('|').map(c => c.trim());
        if (cols[0] === '') cols.shift();
        if (cols[cols.length - 1] === '') cols.pop();
        
        const isSeparator = cols.every(c => c.match(/^:?-+:?$/) || c === '');
        if (isSeparator && currentTableRows.length === 0) {
          continue;
        }
        
        currentTableRows.push(cols);
        continue;
      } else {
        if (currentTableRows.length > 0) {
          blocks.push(flushTable(i));
        }
      }
      
      const isBullet = line.startsWith('* ') || line.startsWith('- ');
      if (isBullet) {
        currentListItems.push(line.substring(2));
        continue;
      } else {
        if (currentListItems.length > 0) {
          blocks.push(flushList(i));
        }
      }
      
      if (line.startsWith('### ')) {
        blocks.push(<h4 key={i} className="chat-h4">{processInlineStyles(line.substring(4))}</h4>);
        continue;
      }
      if (line.startsWith('#### ')) {
        blocks.push(<h5 key={i} className="chat-h5">{processInlineStyles(line.substring(5))}</h5>);
        continue;
      }
      if (line.trim() === '---') {
        blocks.push(<hr key={i} className="chat-hr" />);
        continue;
      }
      if (!line.trim()) {
        blocks.push(<div key={i} className="chat-empty-line" />);
        continue;
      }
      
      blocks.push(<p key={i} className="chat-p">{processInlineStyles(line)}</p>);
    }
    
    if (currentTableRows.length > 0) {
      blocks.push(flushTable(lines.length));
    }
    if (currentListItems.length > 0) {
      blocks.push(flushList(lines.length));
    }
    
    return blocks;
  };

  const hasThinking = parsed.thinking.trim().length > 0;

  return (
    <div className={`ai-message ${sender}`}>
      {sender === 'bot' && hasThinking && (
        <div className="ai-thinking-container">
          <button 
            type="button" 
            className="ai-thinking-toggle" 
            onClick={() => setShowThinking(!showThinking)}
          >
            <svg className={`thinking-chevron ${showThinking ? 'expanded' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="thinking-icon-bulb">💡</span>
            <span>{showThinking ? 'Ẩn suy nghĩ của AI' : 'Xem suy nghĩ của AI'}</span>
          </button>
          {showThinking && (
            <div className="ai-thinking-text">
              {parsed.thinking.split('\n').map((line, i) => (
                <p key={i} className="thinking-line">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="ai-message-body">
        {renderContent(parsed.content)}
      </div>
    </div>
  );
});

export default function Layout({ children }: LayoutProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý AI của Stall Rental.\n\nTôi có thể tư vấn giúp bạn chọn khu vực phù hợp, ngân sách thuê và ngành hàng ngành hàng kinh doanh lý tưởng. Hãy nhập yêu cầu của bạn hoặc chọn các gợi ý bên dưới nhé!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    // Fetch notifications if user is logged in
    const fetchNotifications = async () => {
      if (user && user.id) {
        try {
          const response = await notificationApi.getUnreadByUser(user.id);
          setUnreadNotifications(response.data);
        } catch (err) {
          console.error("Failed to load notifications", err);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const checkToken = () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setUnreadNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const streamChatResponse = async (userText: string) => {
    setIsTyping(true);
    // Add temporary bot message placeholder
    setChatMessages(prev => [...prev, { sender: 'bot', text: '' }]);

    let accumulatedReasoning = '';
    let accumulatedContent = '';

    const updateLastMessage = (text: string) => {
      setChatMessages(prev => {
        const next = [...prev];
        if (next.length > 0) {
          next[next.length - 1] = { sender: 'bot', text };
        }
        return next;
      });
    };

    const getFormattedText = (reasoning: string, content: string) => {
      let text = '';
      if (reasoning.trim()) {
        text += `[THINK]${reasoning.trim()}[/THINK]\n`;
      }
      text += content;
      return text;
    };

    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/ai/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userText })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finished = false;
      let buffer = '';

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) {
          finished = true;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.substring(5).trim();
            if (dataStr === '[DONE]') {
              finished = true;
              break;
            }

            try {
              const chunk = JSON.parse(dataStr);
              if (chunk.reasoning) {
                accumulatedReasoning += chunk.reasoning;
              }
              if (chunk.content) {
                accumulatedContent += chunk.content;
              }
              updateLastMessage(getFormattedText(accumulatedReasoning, accumulatedContent));
            } catch (e) {
              console.warn("Failed to parse chunk JSON:", e);
            }
          }
        }
      }

      if (!accumulatedContent.trim()) {
        const reply = getBotResponse(userText);
        updateLastMessage(reply);
      }
    } catch (err) {
      console.error("Error streaming AI response:", err);
      const reply = getBotResponse(userText);
      updateLastMessage(reply);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    
    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    await streamChatResponse(userText);
  };

  const handleSendSuggestion = async (suggestion: string) => {
    if (isTyping) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: suggestion }]);
    await streamChatResponse(suggestion);
  };

  const isCustomer = user?.role === 'ROLE_CUSTOMER';
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isManager = user?.role === 'ROLE_MANAGER';

  const menuItems = isCustomer
    ? [
        { path: '/dashboard', label: 'Cổng khách thuê', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
        { path: '/bookings', label: 'Đặt chỗ của tôi', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' },
        { path: '/chat-admin', label: 'Chat với quản lý', icon: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z' },
        { path: '/contracts', label: 'Hợp đồng của tôi', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
        { path: '/payments', label: 'Thanh toán & Hóa đơn', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z' },
        { path: '/maintenance', label: 'Yêu cầu hỗ trợ', icon: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.1z' },
      ]
    : isManager
    ? [
        { path: '/dashboard', label: 'Tổng quan phân khu', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
        { path: '/booths', label: 'Gian hàng phụ trách', icon: 'M4 4h7v7H4V4zm6 2H6v3h4V6zm-6 8h7v7H4v-7zm6 2H6v3h4v-3zm8-12h7v7h-7V4zm6 2h-4v3h4V6zm-6 8h7v7h-7v-7zm6 2h-4v3h4v-3z' },
        { path: '/customers', label: 'Khách thuê phân khu', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
        { path: '/chat-customers', label: 'Hỗ trợ khách thuê', icon: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z' },
        { path: '/bookings', label: 'Lịch đặt phân khu', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' },
        { path: '/contracts', label: 'Hợp đồng phân khu', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
      ]
    : [
        { path: '/dashboard', label: 'Tổng quan (Dashboard)', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
        { path: '/booths', label: 'Gian hàng & Khu vực', icon: 'M4 4h7v7H4V4zm6 2H6v3h4V6zm-6 8h7v7H4v-7zm6 2H6v3h4v-3zm8-12h7v7h-7V4zm6 2h-4v3h4V6zm-6 8h7v7h-7v-7zm6 2h-4v3h4v-3z' },
        ...(isAdmin ? [{ path: '/managers', label: 'Quản lý Managers', icon: 'M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.84 0-5.5 1.01-5.5 3v2h11v-2c0-1.99-3.66-3-5.5-3zm-7.5-1c-2.33 0-7 1.17-7 3.5V19h7v-3c0-.88.39-1.66 1.01-2.22.4-.33.89-.59 1.4-.78C10.58 13.08 9.77 13 9 13z' }] : []),
        { path: '/customers', label: 'Khách thuê', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
        { path: '/chat-customers', label: 'Chat với khách hàng', icon: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z' },
        { path: '/bookings', label: 'Đặt chỗ & Báo giá', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' },
        { path: '/contracts', label: 'Hợp đồng thuê', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
        { path: '/payments', label: 'Tài chính & Công nợ', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z' },
        { path: '/maintenance', label: 'Yêu cầu vận hành', icon: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.1z' },
      ];

  return (
    <div className="layout-root">
      {/* Sidebar */}
      <aside className="layout-sidebar">
        <div className="sidebar-brand">
          <span>Stall Rental</span>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout-sidebar">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--color-danger)', width: '18px', height: '18px' }}>
              <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z" />
            </svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="layout-main-container">
        {/* Header */}
        <header className="layout-header">
          <div className="header-title">
            <h1>Hệ thống quản lý thuê gian hàng</h1>
          </div>
          
          <div className="header-actions">
            {/* Notification icon */}
            <div className="notification-bell-container">
              <button className="text-btn-header" onClick={() => setShowNotifications(!showNotifications)}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px', marginRight: '6px' }}>
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                <span>Thông báo</span>
                {unreadNotifications.length > 0 && (
                  <span className="notification-badge">{unreadNotifications.length}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h3>Thông báo mới</h3>
                    <button className="text-btn" onClick={() => setShowNotifications(false)}>Đóng</button>
                  </div>
                  <div className="dropdown-body">
                    {unreadNotifications.length === 0 ? (
                      <p className="no-notifications">Không có thông báo mới.</p>
                    ) : (
                      unreadNotifications.map(notification => (
                        <div key={notification.id} className="notification-item">
                          <div>
                            <h4>{notification.title}</h4>
                            <p>{notification.content}</p>
                            <span className="time">{notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ''}</span>
                          </div>
                          <button className="mark-read-btn" onClick={() => notification.id && handleMarkAsRead(notification.id)}>✓</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="user-profile-header">
              <div className="user-avatar">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.fullName}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="layout-content">
          {children}
        </main>
      </div>

      {/* AI Advisor Chatbox */}
      <button className="ai-advisor-trigger" onClick={() => setIsChatOpen(!isChatOpen)}>
        <span>Trợ lý AI</span>
        <span className="pulse-dot" />
      </button>

      {isChatOpen && (
        <div className="ai-advisor-window">
          <div className="ai-advisor-header">
            <div className="ai-advisor-header-title">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>Trợ lý Tư vấn Gian hàng</h3>
                <span>AI Trực tuyến</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                type="button"
                className="ai-suggestions-toggle-btn"
                title={showSuggestions ? "Ẩn câu hỏi gợi ý" : "Hiện câu hỏi gợi ý"}
                onClick={() => setShowSuggestions(!showSuggestions)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}
              >
                💡
              </button>
              <button className="ai-advisor-close" onClick={() => setIsChatOpen(false)}>&times;</button>
            </div>
          </div>
          
          <div className="ai-advisor-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {msg.sender === 'bot' && (
                  <div className="ai-message-avatar">
                    AI
                  </div>
                )}
                <ChatMessageItem text={msg.text} sender={msg.sender} />
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div className="ai-message-avatar">
                  AI
                </div>
                <div className="ai-message bot typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="ai-advisor-suggestions-wrapper">
            <div className="ai-suggestions-header-bar">
              <span className="ai-suggestions-title">💡 Gợi ý câu hỏi</span>
              <button 
                type="button" 
                className="ai-suggestions-toggle-text-btn"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                {showSuggestions ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
              </button>
            </div>
            {showSuggestions && (
              <div className="ai-advisor-suggestions">
                {[
                  'Dưới 5 triệu nên thuê đâu?',
                  'Tài chính 10 triệu bán quần áo',
                  'Kinh doanh trà sữa/cafe',
                  'Khu C kinh doanh gì tốt?'
                ].map((sug, i) => (
                  <button
                    key={i}
                    className="ai-advisor-suggestion-btn"
                    onClick={() => handleSendSuggestion(sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="ai-advisor-input-area">
            <input
              type="text"
              placeholder="Hỏi về ngân sách, ngành hàng..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="ai-advisor-send-btn">
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
