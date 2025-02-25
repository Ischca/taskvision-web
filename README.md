# TaskVision

## 1. コンセプト

1. **1日の流れは固定されたブロックで管理**  
   - 例：\[
      朝ブロック(8:00-9:30)、  
      午前ブロック(9:30-12:00)、  
      昼ブロック(13:00-14:00)、  
      午後ブロック(14:00-17:00)、  
      夜ブロック(19:00-21:00)\]  
   - このようなブロックの枠組みは原則毎日変わらず、必要があれば随時調整する程度。

2. **メイン操作は「タスクを追加し、適切なブロックに割り当てる」**  
   - ブロック自体を新規に作ったり削除したりする操作は少なく、ユーザーは主に「どのタスクをいつのブロックでやるか」を簡単に管理する。

3. **1日の画面を俯瞰しやすくする**  
   - 「今日はどのブロックにどんなタスクを入れているか」を一目で確認できるUIを中心に据え、詳細操作はスムーズに行えるようにする。

---

## 2. 代表的な画面構成

### 2-1. **メイン画面（Todayビュー）**

- **目的**: 今日1日のブロックとそこに割り当てられているタスクを一覧し、追加/編集を行える。  
- **構成イメージ**:

```
┌─────────────────────────────┐
│  [本日: 2025/02/23]                                │
│                                                    │
│  ┌─────────────────────────────┐
│  │ 朝ブロック (8:00-9:30)                        │
│  │   • タスクA (チェックボックス or 状態)         │
│  │   • タスクB                                     │
│  │   (+) タスク追加ボタン                          │
│  └─────────────────────────────┘
│                                                    │
│  ┌─────────────────────────────┐
│  │ 午前ブロック (9:30-12:00)                     │
│  │   • タスクC                                     │
│  │   (+) タスク追加ボタン                          │
│  └─────────────────────────────┘
│                                                    │
│  ┌─────────────────────────────┐
│  │ 昼ブロック (13:00-14:00)                     │
│  │   • タスクD                                     │
│  │   (+) タスク追加ボタン                          │
│  └─────────────────────────────┘
│  ...                                              │
└─────────────────────────────┘
```

#### ポイント

1. **固定ブロックごとにセクションを区切る**  
   - ブロックは横並びではなく、縦にリストとして時系列順に並べる。  
   - 「朝→午前→昼→午後→夜」といった順序が一目でわかる。

2. **各ブロック内に紐付くタスクが箇条書き**  
   - タスク名と簡易ステータス（完了／未完了など）を表示。  
   - タスク右端に「詳細ボタン」や「削除ボタン」を置くか、スワイプ操作で編集メニューを表示してもよい。

3. **ブロックごとにタスク追加ボタン**  
   - それぞれのブロックセクションの末尾に「＋」ボタンを配置 → そこから新規タスクを作成すると自動的にそのブロックに紐付く。

4. **当日以外の日付の切り替え**  
   - 画面上部の「＜」「＞」ボタン、または日付選択UIで前日/翌日のブロックに切り替え可能。  
   - 毎日同じブロックがあるため、日付が変われば同じブロック名が自動生成される仕様。

---

### 2-2. **タスク追加フロー**

1. **(A) ブロック単位の「＋ボタン」から**  
   - 例: 「午前ブロック」のセクションにある＋ボタンを押す → 下図のようなモーダルが開き、「タスク名」「メモ」程度を入力し[保存]で即ブロックに登録。  

```
┌─────────────────────────────┐
│ [タスク追加]                                 │
│ タスク名: [          ]                        │
│ 詳細メモ: [          ] (任意)                 │
│ (ブロック: 午前ブロック) <- 自動選択済み      │
│ [保存] [キャンセル]                            │
└─────────────────────────────┘
```

2. **(B) 一括タスク登録画面（未割り当てリスト）**  
   - Slackやメールなど外部からタスクを取り込んだ場合、最初は「未割り当てタスク一覧」に入っている。  
   - そこからドラッグ&ドロップ or リスト選択で各ブロックに振り分ける。  
   - 「未割り当て」セクションを設け、そこに溜まったタスクを好きなブロックへ移動できる。

---

### 2-3. **タスク詳細画面**

- タスク名をタップすると詳細画面（モーダルやスライドイン）を表示。  
- **項目例**:  
  - タスク名  
  - 詳細メモ/コメント  
  - 割り当てブロック（変更可）  
  - 締切・所要時間（必要なら）  
  - 完了チェック／削除ボタン  

```
┌─────────────────────────────┐
│ [タスク詳細]                                 │
│ タスク名: 企画書ドラフト                     │
│ ブロック: 午後ブロック(14:00-17:00)         │
│ ------------------------------------------- │
│ 詳細メモ:                                     │
│  - クライアント要件を確認                     │
│  - 文書テンプレートを利用                     │
│ ------------------------------------------- │
│ [完了にする] [削除] [保存]                    │
└─────────────────────────────┘
```

---

### 2-4. **ブロック編集画面（めったに使わない想定）**

- ブロックは基本固定だが、時々時間帯を変更したり削除/追加したりしたい場合のために用意。  
- ホーム画面の「設定アイコン」や「ブロック管理」からアクセス。  
- ブロック名や時間帯を変えて[保存]すると、以後の日付に生成されるブロック定義が更新されるなどの仕様。

```
┌─────────────────────────────┐
│ [ブロック編集]                                │
│ ブロック名:   [ 午前ブロック ]                │
│ 開始時刻:     [ 09:30 ]                       │
│ 終了時刻:     [ 12:00 ]                       │
│ [保存] [削除] [キャンセル]                    │
└─────────────────────────────┘
```

---

## 3. 日常的な操作フロー（例）

1. **朝、アプリを開く**  
   - 「本日(2/23)」の画面には「朝ブロック」「午前ブロック」「昼ブロック」...が固定で並び、それぞれのブロックに何のタスクが割り当てられているかを確認できる。  
   - 未割り当てタスクがある場合、画面上部や下部に「未割り当てタスク」セクションが表示される。そこからドラッグや選択操作で各ブロックへ振り分ける。

2. **タスクを追加する**  
   - 午前ブロック欄の「＋」を押してタスク登録モーダルを表示 → 名前やメモを入力 → [保存] → すぐに午前ブロックのリストに追加される。

3. **タスクの詳細確認・編集**  
   - 登録したタスクをタップ → 詳細画面がスライド表示。  
   - 割り当てブロックを変更したければ、プルダウンで別ブロックを選ぶ or 未割り当てにする。

4. **タスク完了**  
   - 午前ブロック内タスクAのチェックボックスをON → 完了済みに変わり、リスト上はグレーアウトなどで視覚区別。  
   - 完了取り消しもワンタップで可能。

5. **翌日のブロック確認**  
   - 日付選択(「＞」ボタン)で2/24に移動 → 同じブロックが自動生成された画面に遷移。  
   - 前日未完了のタスクを持ち越したり、別のブロックに再アサインする場合は、アプリ側でサポート可能（例: 「未完了タスクの持ち越し」操作）。

---

## 4. リマインド・通知の考え方

1. **ブロック開始前通知（任意）**  
   - ユーザーがセットした時刻（ブロック開始5分前など）に「午前ブロックが始まります。タスクA, Bを実施予定」と通知。  
   - 通知タップでアプリの該当ブロックへジャンプ。

2. **タスクの期日通知（任意）**  
   - タスクに締切がある場合、その前に通知。  
   - ブロックに紐付いているので「今日の午前ブロックでやりたいタスクが未完了」のような形で促す。

3. **ブロック終了時（任意）**  
   - 「午前ブロックが終了します。未完了タスクは午後ブロックに移しますか？」などの通知。  
   - ワンタップで繰り越し操作。

---

## 5. UI/UXの工夫ポイント

1. **ブロックを折りたたみ/展開**  
   - 1日のブロック数が多い場合、折りたたみ表示でコンパクトにし、タップすると展開できる。  
   - 現在時刻に該当するブロックだけ自動展開するなどの工夫で、ユーザーが「今やること」を認識しやすくする。

2. **未割り当てタスクの目立たせ方**  
   - ホーム画面の上部や下部に「未割り当て（xx件）」を目立つデザインで表示し、ドラッグ&ドロップで素早く割り当て。  
   - Slackやメール経由で新しく入ってきたタスクもここに積まれる。

3. **ビジュアルヒントで時間帯を意識**  
   - 朝ブロックは青、午前ブロックは黄、午後ブロックはオレンジ…など背景色やアイコンで時間帯感を表現すると、直感的に把握しやすい。  
   - 現在の時刻が含まれるブロックは枠線を強調 or ハイライト。

4. **タスク数の上限ガイド（オプション）**  
   - 各ブロックに「推奨タスク数 or 推奨所要時間」の目安を表示することで、ブロックに過剰に詰め込みすぎないよう注意喚起を行う（例: 午前ブロックは2時間しかないのにタスク5件は多いかも？など）。

5. **タスクの完了チェックで即時フィードバック**  
   - チェックボックスをONにしたら、タスクがスライドやアニメーションで「完了」表示に移行するなど気持ち良いUXを演出。  
   - ブロックごとの完了タスク数を進捗バーで示すのも有効。
