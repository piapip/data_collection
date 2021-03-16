import React, { useState, useEffect } from 'react'
import {Col, Row} from "antd";

// import Progress from "./Progress";
import LoadingComponent from './../../../Loading/LoadingComponent';

import intentInfo from './../Shared/intent';

export default function Scenario(props) {
  
  const scenario = props ? props.scenario : [];
  const currentIntent = props ? props.currentIntent : [];
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    if (scenario !== []) {
      setLoading(false);
    } else setLoading(true);
  }, [scenario]);

  const generateScript = (
    (scenario && scenario.length !== 0) ? (
      scenario[0][1] === 0 ? (
        <p>Bây giờ bạn quên mất thẻ ngân hàng điện tử và bạn muốn được <b>cấp lại mật khẩu</b>. Bạn hãy miêu tả yêu cầu của bạn càng ngắn gọn càng tốt bằng tiếng Việt. Bạn có thể hỏi thêm thông tin về các vấn đề khác nếu bạn thấy cần thiết. Thẻ của bạn là thẻ {intentInfo.DIGITAL_BANK[scenario[1][1]].name}.</p>
      ) : 
      scenario[0][1] === 1 ? (
        <p>Bạn muốn tìm hiểu về <b>chương trình ưu đãi</b> ở ngân hàng. Bạn hãy miêu tả yêu cầu của bạn càng ngắn gọn càng tốt bằng tiếng Việt. Bạn có thể hỏi thêm thông tin về các vấn đề khác nếu bạn thấy cần thiết. <b>Loại thẻ</b> bây giờ bạn muốn tìm hiểu nhất là <b>{intentInfo.CARD_TYPE[scenario[1][1]].name}</b>.</p>
      ) :
      (scenario[0][1] === 2 || scenario[0][1] === 6) ? (
        <p>Bạn muốn tìm hiểu về <b>{intentInfo.INTENT[scenario[0][1]].name.toLowerCase()}</b> ở ngân hàng. Bạn hãy miêu tả yêu cầu của bạn càng ngắn gọn càng tốt bằng tiếng Việt. Bạn có thể hỏi thêm thông tin về các vấn đề khác nếu bạn thấy cần thiết. <b>Mục đích vay</b> của bạn là <b>{intentInfo.LOAN_PURPOSE[scenario[1][1]].name.toLowerCase()}</b> và <b>hình thức vay</b> bạn dự định là <b>{intentInfo.LOAN_TYPE[scenario[2][1]].name.toLowerCase()}</b>.</p>
      ) : 
      (scenario[0][1] === 3 || scenario[0][1] === 4) ? (
        <p>Bạn muốn tìm <b>{intentInfo.INTENT[scenario[0][1]].name.toLowerCase()}</b> gần chỗ bạn. Bạn hãy miêu tả yêu cầu của bạn càng ngắn gọn càng tốt bằng tiếng Việt. Bạn có thể hỏi thêm thông tin về các vấn đề khác nếu bạn thấy cần thiết. Bạn cần mô tả <b>vị trí</b> của bạn cho servant để được cung cấp thông tin chi tiết nhất.</p>
      ) : 
      (scenario[0][1] === 5 || scenario[0][1] === 9) ? (
        <p>Bạn muốn tìm hiểu về <b>{intentInfo.INTENT[scenario[0][1]].name.toLowerCase()}</b> từ ngân hàng. Bạn hãy miêu tả yêu cầu của bạn càng ngắn gọn càng tốt bằng tiếng Việt. Bạn có thể hỏi thêm thông tin về các vấn đề khác nếu bạn thấy cần thiết. <b>Nhóm thẻ</b> bạn muốn tìm hiểu là <b>{intentInfo.CARD_TYPE[scenario[1][1]].name.toLowerCase()}</b> và <b>hình thức thẻ</b> bạn dự định là <b>{intentInfo.LOAN_TYPE[scenario[2][1]].name.toLowerCase()}</b>.</p>
      ) : 
      (scenario[0][1] === 7 || scenario[0][1] === 10 || scenario[0][1] === 11 || scenario[0][1] === 12 || scenario[0][1] === 16 || scenario[0][1] === 17) ? (
        <p>Bạn muốn thực hiện  <b>{intentInfo.INTENT[scenario[0][1]].name.toLowerCase()}</b> tại ngân hàng. Bạn hãy miêu tả yêu cầu của bạn càng ngắn gọn càng tốt bằng tiếng Việt. Bạn có thể hỏi thêm thông tin về các vấn đề khác nếu bạn thấy cần thiết. Bạn cần cung cấp <b>thông tin cá nhân</b> của bạn cho servant để được cung cấp thông tin chi tiết nhất.</p>
      ) : 
      scenario[0][1] === 8 ? (
        <p>Bạn muốn tìm hiểu về thủ tục <b>hướng dẫn mở thẻ</b>. Bạn hãy miêu tả yêu cầu của bạn càng ngắn gọn càng tốt bằng tiếng Việt. Bạn có thể hỏi thêm thông tin về các vấn đề khác nếu bạn thấy cần thiết. Hình thức mở thẻ bạn cần tìm hiểu là <b>{intentInfo.CARD_ACTIVATION_TYPE[scenario[1][1]].name.toLowerCase()}</b>.</p>
      ) : 
      (scenario[0][1] === 13 || scenario[0][1] === 14 || scenario[0][1] === 15) ? (
        <p>Bạn muốn tra cứu <b>{intentInfo.INTENT[scenario[0][1]].name.toLowerCase()}</b> tại ngân hàng. Bạn hãy miêu tả yêu cầu của bạn càng ngắn gọn càng tốt bằng tiếng Việt. Bạn có thể hỏi thêm thông tin về các vấn đề khác nếu bạn thấy cần thiết. <b>Ngân hàng điện tử</b> bạn quan tâm tới là <b>{intentInfo.DIGITAL_BANK[scenario[1][1]].name.toLowerCase()}</b>.</p>
      ) : "How...???"
    ) : (
      <p>Kitira</p>
    )
  )

  return (
    <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",alignItems:"stretch"}}>
      {/* <Row style={{borderLeft:"1px solid",height:"100%",borderColor:"white",backgroundColor:"white"}}></Row> */}
      <Row style={{height:"100%"}}>
        <h3 style={{fontWeight:'bold',fontSize:'18px',textAlign: "center"}}>Kịch bản hội thoại</h3>
        <Col span={24} style={{fontSize:"15px",marginTop:"auto", padding: "10px"}}>
          {
            loading ? (
              <LoadingComponent />
            ) : (
              generateScript
            )
          }
        </Col>
        {/* <Col span={24}>
          <Progress
            scenario={scenario}
            currentIntent={currentIntent}/>
        </Col> */}
      </Row>
    </div>
  )
}
