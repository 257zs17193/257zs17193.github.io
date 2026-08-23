/**
 * ポートフォリオチャットボット - クライアント側の応答処理
 */

// ポートフォリオのデータベース（質問応答のマッピング）
const botKnowledgeBase = {
  // パターンマッチング用の質問-応答ペア
  patterns: [
    {
      keywords: ['やあ', 'こんにちは', 'こんばんは', 'おはよう', 'おはよう', 'hello', 'hi'],
      responses: [
        'こんにちは！ポートフォリオへようこそ。何かご質問はありますか？',
        'こんにちは！何でしたら質問してください。'
      ]
    },
    {
      keywords: ['誰', 'だれ', '名前'],
      responses: [
        '私はこのポートフォリオの所有者です。1-15クラス所属の社会人学生です。'
      ]
    },
    {
      keywords: ['好き', '食べ物', 'パイン', 'バーグ'],
      responses: [
        'パインバーグディッシュが好きです！'
      ]
    },
    {
      keywords: ['所在地', 'どこ', '住み', '住まい'],
      responses: [
        '埼玉県に所在しています。出身は熊本県、育ちは北海道です。'
      ]
    },
    {
      keywords: ['仕事', '職業', 'IT', '業務'],
      responses: [
        'IT系の業務に従事しています。2022年4月から、企画・設計～開発～保守を行っています。自社製品に加え、新製品開発・受託業務も行っています。'
      ]
    },
    {
      keywords: ['スキル', '技術', '言語', 'プログラミング'],
      responses: [
        '保有する技術スタックとしては、C/C++, C#, JavaScript, TypeScript, Python, VBA, HTML, CSSなどのプログラミング言語。Node.js, Next.js, React, Tailwind CSSなどのフレームワーク・ライブラリ。AWS, Docker, PostgreSQL, DynamoDB等の環境ツールを使用しています。'
      ]
    },
    {
      keywords: ['大学', '学校', '高専', 'zen','経歴', 'バックグラウンド', '学歴', '入学'],
      responses: [
        '2025年4月にZEN大学に入学しました。高等専門学校では電気電子系と経営を学びました。'
      ]
    },
    {
      keywords: ['資格', '免許', '検定'],
      responses: [
        'JDLA Deep Learning for GENERAL (G検定)と普通自動車第一種運転免許を持っています。'
      ]
    },
    {
      keywords: ['ハードウェア', 'arduino', 'raspberry', 'pi', 'plc'],
      responses: [
        'Raspberry Pi、Arduino、PLC（シーケンス制御）などのハードウェアの経験があります。はんだ付けやモータ制御も行っています。'
      ]
    },
    {
      keywords: ['作品', 'プロダクト', 'アウトプット', '出力', '実績', 'プロジェクト', '制作物', '開発'],
      responses: [
        '主な実績としては、業務改革用のタスク管理ボード、CRMツール、Chrome拡張の社員情報変換ツール、社員の誕生日通知ツール、エクセルマクロなどがあります。'
      ]
    },
    {
      keywords: ['ありがとう'],
      responses: [
        'こちらこそ、ご利用ありがとうございます！'
      ]
    },
    {
      keywords: ['ハンバーグ', 'びっくりドンキー'],
      responses: [
        'ハンバーグは好物です！びっくりドンキーへぜひ！'
      ]
    },
    {
      keywords: ['紅茶', 'tea', '飲み物'],
      responses: [
        'ルピシアの店舗限定紅茶がおすすめです。'
      ]
    },
    {
      keywords: ['Webアプリケーション開発', '授業', '感想', 'どうでした'],
      responses: [
        'Webアプリケーション開発の授業はとても楽しかったです！先生のこっちに話しかけてくれている感のあるスタイルが好きでした。 \
        あと、作業のミスなどをそのままうつしてくださるので、非常に安心してます(私もよく間違えるので…)。 \
        Webアプリケーション開発の授業を受け終わってしまい残念です。 \
        次は「JavaScriptによる自動化、効率化」をぜひ受けたいと思っています。よろしくお願いします！'
      ]
    },
    {
      keywords: ['好きな授業', '大学で', 'お気に入り', 'おすすめの授業'],
      responses: [
        '二次創作の歴史から見るネット文化の授業が色々な方の話を聞けて面白いです！',
        'ネット情報発信概論も面白いです！'
      ]
    }
  ],

  // わからない時の応答
  unknownResponses: [
    '申し訳ありません。その質問には答えられません。ポートフォリオについて他に質問があればお聞きします。',
    'その内容についてはよくわかりません。次のアップデートをお待ちください！',
    'そちらについては情報がありません。次のアップデートをお待ちください！',
    '来年の授業の時にはこたえられるようにしますね！'
  ]
};

/**
 * ユーザーの質問に基づいて、適切な応答を生成する
 * @param {string} userMessage - ユーザーの入力メッセージ
 * @returns {string} ボットの応答
 */
function getBotResponse(userMessage) {
  // メッセージを小文字に統一して処理
  const normalizedMessage = userMessage.toLowerCase();

  // パターンマッチングで応答を検索
  for (const pattern of botKnowledgeBase.patterns) {
    for (const keyword of pattern.keywords) {
      if (normalizedMessage.includes(keyword)) {
        // マッチしたパターンからランダムに応答を選択
        const randomIndex = Math.floor(Math.random() * pattern.responses.length);
        return pattern.responses[randomIndex];
      }
    }
  }

  // マッチしなかった場合は、わからない応答をランダムに返す
  const randomIndex = Math.floor(Math.random() * botKnowledgeBase.unknownResponses.length);
  return botKnowledgeBase.unknownResponses[randomIndex];
}

// Export (Node.js環境でのテスト用)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getBotResponse };
}
