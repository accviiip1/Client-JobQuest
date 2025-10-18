# Chức năng Nhắn tin Real-time

Hệ thống nhắn tin real-time sử dụng Firestore Firebase với cấu trúc dữ liệu được thiết kế để hỗ trợ cả user và company.

## 🚀 Tính năng

### ✅ Nhắn tin Real-time
- **Gửi và nhận tin nhắn** real-time giữa user và company
- **Auto-scroll** đến tin nhắn mới nhất
- **Đánh dấu đã đọc** tự động
- **Badge thông báo** số tin nhắn chưa đọc
- **Cập nhật real-time** mỗi 3 giây

### ✅ Giao diện Chat
- **ChatBox** popup với thiết kế đẹp
- **Responsive** design cho mobile
- **Animation** mượt mà
- **Loading states** và error handling

### ✅ Quản lý Cuộc trò chuyện
- **Danh sách cuộc trò chuyện** với tin nhắn cuối cùng
- **Sắp xếp theo thời gian** gần nhất
- **Hiển thị số tin nhắn chưa đọc**
- **Trang Messages** riêng biệt

## 📦 Cấu trúc Firebase

### Collection: messages
```javascript
{
  senderType: "user" | "company",
  senderId: "1",
  receiverType: "user" | "company", 
  receiverId: "5",
  text: "Hello",
  timestamp: serverTimestamp(),
  seen: false
}
```

## 🎯 Cách sử dụng

### 1. Nút Nhắn tin
```jsx
import MessageButton from "../../components/chat/MessageButton";

<MessageButton
  otherUser={{
    id: user.id,
    name: user.name,
    avatar: user.avatar
  }}
  otherType="user"
  otherId={user.id}
  className="message-button--profile"
/>
```

### 2. ChatBox Component
```jsx
import ChatBox from "../../components/chat/ChatBox";

<ChatBox
  isOpen={isChatOpen}
  onClose={handleCloseChat}
  otherUser={otherUser}
  otherType="user"
  otherId="123"
  onSendMessage={handleSendMessage}
/>
```

### 3. Hook useMessages
```jsx
import useMessages from "../../hooks/useMessages";

const {
  messages,
  loading,
  error,
  sendMessage,
  markAsRead
} = useMessages(userType, userId, otherType, otherId);
```

### 4. Service API
```jsx
import messageService from "../../services/messageService";

// Gửi tin nhắn
await messageService.sendMessage(messageData);

// Lấy tin nhắn
const response = await messageService.getMessages(userType, userId, otherType, otherId);

// Lấy cuộc trò chuyện
const conversations = await messageService.getConversations(userType, userId);
```

## 🎨 Styling

### CSS Classes
```scss
.message-button {
  // Nút nhắn tin chính
  &--profile { /* Variant cho profile */ }
  &--header { /* Variant cho header */ }
  &--company-card { /* Variant cho company card */ }
  &--job-card { /* Variant cho job card */ }
}

.chat-box {
  // Container chat box
  &__header { /* Header chat */ }
  &__messages { /* Khu vực tin nhắn */ }
  &__input-form { /* Form nhập tin nhắn */ }
}

.conversations-list {
  // Danh sách cuộc trò chuyện
  &__item { /* Item cuộc trò chuyện */ }
  &__header { /* Header danh sách */ }
}
```

## 📱 Responsive

- **Desktop**: ChatBox 350x500px, nút nhắn tin 44x44px
- **Tablet**: ChatBox responsive, nút nhắn tin 40x40px  
- **Mobile**: ChatBox full screen, nút nhắn tin 36x36px

## 🔧 API Endpoints

### Backend Routes
```javascript
POST /api/message/send          // Gửi tin nhắn
GET  /api/message/messages      // Lấy tin nhắn giữa 2 người
GET  /api/message/conversations // Lấy danh sách cuộc trò chuyện
POST /api/message/mark-read     // Đánh dấu đã đọc
GET  /api/message/unread-count  // Lấy số tin nhắn chưa đọc
```

## 🎯 Tích hợp vào các trang

### 1. Trang cá nhân User (DetailUser)
- Nút nhắn tin ở góc phải header
- Chỉ hiển thị khi xem profile người khác

### 2. Trang cá nhân Company (DetailCompany)  
- Nút nhắn tin bên cạnh nút "Theo dõi"
- Chỉ hiển thị khi xem profile công ty khác

### 3. Header
- Icon tin nhắn bên cạnh icon thông báo
- Link đến trang `/tin-nhan`

### 4. Trang Messages
- Route: `/tin-nhan`
- Hiển thị danh sách cuộc trò chuyện
- Cho phép mở chat với bất kỳ cuộc trò chuyện nào

## 🔄 Real-time Updates

### Polling Strategy
- **Tin nhắn**: Cập nhật mỗi 3 giây
- **Cuộc trò chuyện**: Cập nhật mỗi 5 giây  
- **Số tin nhắn chưa đọc**: Cập nhật mỗi 5 giây

### Auto Actions
- **Auto-scroll** đến tin nhắn mới
- **Auto-mark-read** khi mở chat
- **Auto-refresh** danh sách cuộc trò chuyện

## 🐛 Troubleshooting

### Tin nhắn không gửi được
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra API `/message/send` có hoạt động không
- Kiểm tra console có lỗi không

### Không cập nhật real-time
- Kiểm tra interval có hoạt động không
- Kiểm tra Firebase connection
- Kiểm tra network connection

### Badge không hiển thị
- Kiểm tra API `/message/unread-count`
- Kiểm tra logic đánh dấu đã đọc
- Kiểm tra CSS badge có bị ẩn không

## 📊 Performance

- **Polling interval**: 3-5 giây (có thể điều chỉnh)
- **Auto-scroll**: Smooth animation
- **Memory efficient**: Sử dụng useCallback và useMemo
- **Lazy loading**: Chỉ load tin nhắn khi cần

## 🔒 Security

- **Authentication required**: Phải đăng nhập để sử dụng
- **User validation**: Kiểm tra quyền truy cập
- **Input sanitization**: Làm sạch dữ liệu đầu vào
- **Rate limiting**: Giới hạn số tin nhắn gửi

## 🚀 Future Enhancements

- **WebSocket**: Thay thế polling bằng WebSocket
- **File sharing**: Gửi file, hình ảnh
- **Voice messages**: Tin nhắn thoại
- **Group chat**: Chat nhóm
- **Message reactions**: React tin nhắn
- **Message search**: Tìm kiếm tin nhắn

