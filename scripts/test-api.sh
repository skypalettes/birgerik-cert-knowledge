#!/bin/bash

# Birgerik Core API テストスクリプト
# Usage: ./scripts/test-api.sh <email> <password>

set -e

# 色の定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# APIベースURL
BASE_URL="http://localhost:3000/api/v1"

# 引数チェック
if [ $# -ne 2 ]; then
    echo -e "${RED}Usage: $0 <email> <password>${NC}"
    echo "Example: $0 user@example.com mypassword"
    exit 1
fi

EMAIL=$1
PASSWORD=$2

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Birgerik Core API テスト${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# テスト結果カウンター
PASSED=0
FAILED=0

# テスト関数
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5

    echo -n "Testing: $name... "

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# 1. ログインテスト
echo -e "${YELLOW}[1/6] 認証テスト${NC}"
echo "ログイン中..."

login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# jqがインストールされているか確認
if command -v jq &> /dev/null; then
    TOKEN=$(echo $login_response | jq -r '.token')
    USER_EMAIL=$(echo $login_response | jq -r '.user.email')

    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✓ ログイン成功${NC}"
        echo "User: $USER_EMAIL"
        echo "Token: ${TOKEN:0:20}..."
        ((PASSED++))
    else
        echo -e "${RED}✗ ログイン失敗${NC}"
        echo "Response: $login_response"
        ((FAILED++))
        exit 1
    fi
else
    # jqがない場合は手動でトークンを抽出（簡易版）
    TOKEN=$(echo $login_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✓ ログイン成功${NC}"
        echo "Token: ${TOKEN:0:20}..."
        ((PASSED++))
    else
        echo -e "${RED}✗ ログイン失敗${NC}"
        echo "Response: $login_response"
        echo -e "${YELLOW}Note: Install 'jq' for better JSON parsing${NC}"
        ((FAILED++))
        exit 1
    fi
fi

echo ""

# 2. ユーザー情報取得テスト
echo -e "${YELLOW}[2/6] ユーザー情報取得${NC}"
test_endpoint "GET /auth/me" "GET" "/auth/me" "" 200
echo ""

# 3. 資格エンドポイントテスト
echo -e "${YELLOW}[3/6] 資格エンドポイント${NC}"
test_endpoint "GET /certifications" "GET" "/certifications" "" 200

# 資格を作成
create_cert_response=$(curl -s -X POST "$BASE_URL/certifications" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Certification","description":"API test"}')

if command -v jq &> /dev/null; then
    CERT_ID=$(echo $create_cert_response | jq -r '.id')
    if [ "$CERT_ID" != "null" ] && [ -n "$CERT_ID" ]; then
        echo -e "Testing: POST /certifications... ${GREEN}✓ PASS${NC}"
        echo "Created certification ID: $CERT_ID"
        ((PASSED++))
    else
        echo -e "Testing: POST /certifications... ${RED}✗ FAIL${NC}"
        ((FAILED++))
    fi
else
    CERT_ID=$(echo $create_cert_response | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$CERT_ID" ]; then
        echo -e "Testing: POST /certifications... ${GREEN}✓ PASS${NC}"
        echo "Created certification ID: $CERT_ID"
        ((PASSED++))
    else
        echo -e "Testing: POST /certifications... ${RED}✗ FAIL${NC}"
        ((FAILED++))
    fi
fi

if [ -n "$CERT_ID" ]; then
    test_endpoint "GET /certifications/:id" "GET" "/certifications/$CERT_ID" "" 200
    test_endpoint "PUT /certifications/:id" "PUT" "/certifications/$CERT_ID" \
        '{"name":"Updated Certification","description":"Updated"}' 200
fi

echo ""

# 4. 問題集エンドポイントテスト
echo -e "${YELLOW}[4/6] 問題集エンドポイント${NC}"
test_endpoint "GET /question-sets" "GET" "/question-sets" "" 200

if [ -n "$CERT_ID" ]; then
    create_qset_response=$(curl -s -X POST "$BASE_URL/question-sets" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"Test Question Set\",\"description\":\"API test\",\"certification_id\":\"$CERT_ID\"}")

    if command -v jq &> /dev/null; then
        QSET_ID=$(echo $create_qset_response | jq -r '.id')
    else
        QSET_ID=$(echo $create_qset_response | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    fi

    if [ -n "$QSET_ID" ] && [ "$QSET_ID" != "null" ]; then
        echo -e "Testing: POST /question-sets... ${GREEN}✓ PASS${NC}"
        echo "Created question set ID: $QSET_ID"
        ((PASSED++))
    else
        echo -e "Testing: POST /question-sets... ${RED}✗ FAIL${NC}"
        ((FAILED++))
    fi
fi

echo ""

# 5. 問題エンドポイントテスト
echo -e "${YELLOW}[5/6] 問題エンドポイント${NC}"
test_endpoint "GET /questions" "GET" "/questions" "" 200

if [ -n "$QSET_ID" ]; then
    create_q_response=$(curl -s -X POST "$BASE_URL/questions" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"question_text\":\"Test question?\",\"explanation\":\"Test\",\"is_multiple_choice\":false,\"question_set_id\":\"$QSET_ID\",\"choices\":[{\"choice_text\":\"A\",\"is_correct\":true},{\"choice_text\":\"B\",\"is_correct\":false}]}")

    if command -v jq &> /dev/null; then
        Q_ID=$(echo $create_q_response | jq -r '.id')
    else
        Q_ID=$(echo $create_q_response | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    fi

    if [ -n "$Q_ID" ] && [ "$Q_ID" != "null" ]; then
        echo -e "Testing: POST /questions... ${GREEN}✓ PASS${NC}"
        echo "Created question ID: $Q_ID"
        ((PASSED++))
    else
        echo -e "Testing: POST /questions... ${RED}✗ FAIL${NC}"
        ((FAILED++))
    fi
fi

echo ""

# 6. 学習エンドポイントテスト
echo -e "${YELLOW}[6/6] 学習エンドポイント${NC}"
test_endpoint "GET /study/certifications" "GET" "/study/certifications" "" 200

if [ -n "$QSET_ID" ]; then
    test_endpoint "GET /study/question-sets/:id" "GET" "/study/question-sets/$QSET_ID" "" 200
    test_endpoint "GET /study/questions/:id" "GET" "/study/questions/$QSET_ID" "" 200
fi

echo ""

# クリーンアップ（オプション）
echo -e "${YELLOW}クリーンアップ${NC}"
if [ -n "$Q_ID" ]; then
    echo -n "Deleting question... "
    curl -s -X DELETE "$BASE_URL/questions/$Q_ID" \
        -H "Authorization: Bearer $TOKEN" > /dev/null
    echo -e "${GREEN}✓${NC}"
fi

if [ -n "$QSET_ID" ]; then
    echo -n "Deleting question set... "
    curl -s -X DELETE "$BASE_URL/question-sets/$QSET_ID" \
        -H "Authorization: Bearer $TOKEN" > /dev/null
    echo -e "${GREEN}✓${NC}"
fi

if [ -n "$CERT_ID" ]; then
    echo -n "Deleting certification... "
    curl -s -X DELETE "$BASE_URL/certifications/$CERT_ID" \
        -H "Authorization: Bearer $TOKEN" > /dev/null
    echo -e "${GREEN}✓${NC}"
fi

echo ""

# 結果サマリー
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}テスト結果${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}PASSED: $PASSED${NC}"
echo -e "${RED}FAILED: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ すべてのテストが成功しました！${NC}"
    exit 0
else
    echo -e "${RED}✗ 一部のテストが失敗しました${NC}"
    exit 1
fi
