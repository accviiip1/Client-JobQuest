# Notification Popup System với Firebase

Hệ thống thông báo popup tự động hiển thị khi có thông báo mới từ Firebase, không thay đổi cấu trúc Firebase hiện có.

## 🚀 Tính năng

### ✅ Notification Popup với Firebase
- **Tự động phát hiện** thông báo mới từ Firebase
- **Real-time monitoring** - kiểm tra mỗi 5 giây
- **Icon thông báo** với badge hiển thị số lượng
- **Thông báo mới** với số lượng cụ thể
- **Nút "Xem ngay"** link đến trang thông báo
- **Nút đóng (X)** để ẩn popup
- **Auto-close** sau 10 giây với progress bar
- **Animation** slide in/out mượt mà
- **Responsive** design

## 📦 Cách hoạt động

### 1. Firebase Integration
- Sử dụng API endpoint `/notification/unread-count` để lấy số thông báo
- Kiểm tra định kỳ mỗi 5 giây
- Phát hiện thông báo mới khi số lượng tăng
- Tự động hiển thị popup

### 2. Hook: useFirebaseNotifications
```jsx
const { notificationCount, isVisible, hidePopup, showPopup } = useFirebaseNotifications();
```

**Properties:**
- `notificationCount`: Số lượng thông báo chưa đọc
- `isVisible`: Trạng thái hiển thị popup
- `hidePopup`: Function ẩn popup
- `showPopup`: Function hiển thị popup thủ công

### 3. Component: NotificationPopup
```jsx
<NotificationPopup
  isVisible={isVisible}
  onClose={hidePopup}
  notificationCount={notificationCount}
  onViewNotifications={handleViewNotifications}
/>
```

## 🎯 Tích hợp vào Header

### Header.jsx
```jsx
import { useFirebaseNotifications } from "../../hooks/useFirebaseNotifications";
import NotificationPopup from "../notification/NotificationPopup";

const Header = () => {
  const { notificationCount, isVisible, hidePopup, showPopup } = useFirebaseNotifications();
  
  const handleViewNotifications = () => {
    navigate('/thong-bao');
  };

  return (
    <>
      {/* Header content */}
      
      <NotificationPopup
        isVisible={isVisible}
        onClose={hidePopup}
        notificationCount={notificationCount}
        onViewNotifications={handleViewNotifications}
      />
    </>
  );
};
```

## 🔧 Test

### API Test
```bash
# Tạo thông báo test
POST /api/notification/test
{
  "type": "user", // hoặc "company"
  "message": "Thông báo test"
}
```

## 📝 Logic hoạt động

### Khi nào hiển thị popup:
1. **Load ban đầu**: Lấy số thông báo từ Firebase
2. **Kiểm tra định kỳ**: Mỗi 5 giây kiểm tra thông báo mới
3. **Phát hiện thay đổi**: Khi `notificationCount` tăng
4. **Hiển thị popup**: Tự động hiển thị với animation

### Auto-close:
- Tự động ẩn sau 10 giây
- Có progress bar hiển thị thời gian
- Có thể đóng thủ công bằng nút X

### Navigation:
- Click "Xem ngay" → chuyển đến `/thong-bao`
- Sử dụng React Router navigation

## 🎨 Styling

### CSS Classes
```scss
.notification-popup {
  // Container chính
  &__content {
    // Nội dung popup
  }
  
  &__icon {
    // Icon thông báo
  }
  
  &__badge {
    // Badge số lượng
  }
  
  &__message {
    // Nội dung thông báo
  }
  
  &__view-btn {
    // Nút "Xem ngay"
  }
  
  &__close-btn {
    // Nút đóng
  }
  
  &__progress {
    // Progress bar
  }
}
```

## 📱 Responsive

- **Desktop**: Hiển thị ở góc phải trên
- **Mobile**: Hiển thị full width với padding
- **Auto-adjust**: Tự động điều chỉnh kích thước

## 🐛 Troubleshooting

### Popup không hiển thị
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra API `/notification/unread-count` có hoạt động không
- Kiểm tra console có lỗi không

### Không tự động hiển thị
- Đảm bảo có thông báo mới trong Firebase
- Kiểm tra interval 5 giây có hoạt động không
- Kiểm tra logic so sánh `lastCount`

### Không navigate được
- Kiểm tra React Router đã setup chưa
- Kiểm tra route `/thong-bao` có tồn tại không

## 🔄 Cấu trúc Firebase

Hệ thống sử dụng cấu trúc Firebase hiện có:
```javascript
// Collection: notifications
{
  receiverId: "user_id",
  type: "user", // hoặc "company"
  message: "Nội dung thông báo",
  createdAt: Date,
  isRead: false
}
```

## 📊 Performance

- **Polling interval**: 5 giây (có thể điều chỉnh)
- **Auto-close**: 10 giây
- **Animation duration**: 300ms
- **Memory efficient**: Sử dụng useCallback và useMemo

# Hướng dẫn Debug Lỗi Message API

## Lỗi 500 Internal Server Error khi gửi tin nhắn

### Nguyên nhân có thể:

1. **Server không chạy**: Backend server không hoạt động
2. **Firebase configuration**: Thiếu hoặc sai cấu hình Firebase Admin
3. **Firebase Security Rules**: Không có quyền read/write vào Firestore
4. **Service Account**: File `serviceAccountKey.json` không đúng hoặc thiếu
5. **Network issues**: Không thể kết nối đến Firebase
6. **Database connection**: Lỗi kết nối database

### Cách debug:

1. **Kiểm tra Console**: Mở Developer Tools và xem console logs
2. **Sử dụng các nút test**: Trong ChatBox có các nút test để kiểm tra:
   - "Test Debug": Hiển thị thông tin user hiện tại
   - "Test Server": Kiểm tra kết nối server qua axios
   - "Test Message API": Test API message với dữ liệu mẫu qua axios
   - "Test Simple": Kiểm tra kết nối server qua fetch
   - "Test Endpoint": Test message endpoint trực tiếp qua fetch
   - "Debug Server": Chạy script debug toàn diện (bao gồm Firebase test)
   - "Debug User": Kiểm tra thông tin user

3. **Kiểm tra Network tab**: Xem request/response chi tiết

### Các bước khắc phục:

1. **Khởi động server**: 
   ```bash
   cd api
   npm start
   ```

2. **Kiểm tra Firebase**: 
   - Đảm bảo file `serviceAccountKey.json` tồn tại trong thư mục `api/`
   - Kiểm tra Firebase Security Rules cho collection "messages"
   - Đảm bảo project ID và credentials đúng

3. **Kiểm tra logs server**: Xem console của server có lỗi gì không

4. **Test Firebase trực tiếp**: Truy cập `http://localhost:8800/api/test-firebase`

### Cấu trúc dữ liệu expected:

```javascript
{
  senderType: "user" | "company",
  senderId: "string", // Phải là ID thực từ database
  receiverType: "user" | "company", 
  receiverId: "string", // Phải là ID thực từ database
  text: "string"
}
```

### Validation ID:

1. **ID phải là số hợp lệ**: `senderId` và `receiverId` phải là số hoặc string số
2. **ID phải tồn tại**: ID phải tồn tại trong database
3. **Loại user hợp lệ**: `senderType` và `receiverType` phải là "user" hoặc "company"

### Cách lấy ID thực:

1. **User ID**: Lấy từ `/api/user/owner` endpoint
2. **Company ID**: Lấy từ `/api/company/owner` endpoint
3. **JWT Token**: ID được lưu trong JWT token khi đăng nhập

### Debug ID:

- Sử dụng nút "Test Get Current User Info" để lấy thông tin user hiện tại
- Sử dụng nút "Test Message API with Real IDs" để test với ID thực
- Kiểm tra console logs để xem ID được gửi đi

### Logs quan trọng cần kiểm tra:

- "API Base URL": URL của API server
- "ChatBox - Thông tin user": Thông tin user hiện tại
- "Dữ liệu tin nhắn gửi đi": Dữ liệu được gửi đến API
- "API Request": Chi tiết request gửi đi
- "API Response Error": Chi tiết lỗi từ server
- "Received message data": Dữ liệu nhận được ở server
- "Saving message to Firebase": Quá trình lưu vào Firebase
- "Lỗi gửi tin nhắn chi tiết": Chi tiết lỗi Firebase

### Kiểm tra server:

1. **Chạy server**: `cd api && npm start`
2. **Kiểm tra port**: Đảm bảo server chạy ở port 8800
3. **Kiểm tra logs**: Xem console của server có lỗi gì không
4. **Test endpoint**: Sử dụng Postman hoặc curl để test trực tiếp

### Ví dụ test với curl:

```bash
# Test server connection
curl http://localhost:8800/

# Test Firebase
curl http://localhost:8800/api/test-firebase

# Test message API
curl -X POST http://localhost:8800/api/message/send \
  -H "Content-Type: application/json" \
  -d '{
    "senderType": "user",
    "senderId": "1",
    "receiverType": "company",
    "receiverId": "1",
    "text": "Test message"
  }'
```

### Kiểm tra Firebase:

1. **File serviceAccountKey.json**: Đảm bảo file tồn tại trong thư mục `api/`
2. **Cấu hình Firebase**: Đảm bảo project ID và credentials đúng
3. **Firestore rules**: Đảm bảo có quyền read/write vào collection "messages"
4. **Network connection**: Đảm bảo có thể kết nối đến Firebase

### Firebase Security Rules mẫu:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read, write: if true; // Cho phép tất cả (chỉ dùng cho test)
    }
  }
}
```

### Tạo Firebase Index (Giải pháp dài hạn):

Để tránh lỗi index, bạn cần tạo composite index trong Firebase Console:

1. **Truy cập Firebase Console**: https://console.firebase.google.com/
2. **Chọn project**: `tuyendungvieclam-28558`
3. **Vào Firestore Database** → **Indexes**
4. **Tạo các index sau**:

#### Index 1: Cho getMessages
- **Collection**: `messages`
- **Fields**:
  - `senderType` (Ascending)
  - `senderId` (Ascending) 
  - `receiverType` (Ascending)
  - `receiverId` (Ascending)
  - `timestamp` (Ascending)

#### Index 2: Cho getConversations (sent)
- **Collection**: `messages`
- **Fields**:
  - `senderType` (Ascending)
  - `senderId` (Ascending)
  - `