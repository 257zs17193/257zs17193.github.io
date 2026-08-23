// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Bootstrap JavaScript
import 'bootstrap';

// jQuery
import $ from 'jquery';

// コメント投稿処理
$(document).ready(function() {
  // コメント投稿フォーム
  $('#comment-form').on('submit', async function(e) {
    e.preventDefault();

    const content = $('#comment-content').val().trim();
    if (!content) {
      alert('コメント内容を入力してください');
      return;
    }

    const submitBtn = $(this).find('button[type="submit"]');
    submitBtn.prop('disabled', true).text('投稿中...');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.status === 'OK') {
        // ページをリロードして新しいコメントを表示
        location.reload();
      } else {
        alert('エラーが発生しました: ' + data.message);
        submitBtn.prop('disabled', false).text('投稿');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('コメントの投稿に失敗しました');
      submitBtn.prop('disabled', false).text('投稿');
    }
  });

  // コメント削除処理
  $('.delete-comment').on('click', async function() {
    if (!confirm('このコメントを削除しますか？')) {
      return;
    }

    const commentId = $(this).data('comment-id');
    const commentElement = $(`.comment-item[data-comment-id="${commentId}"]`);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.status === 'OK') {
        // コメント要素をフェードアウトして削除
        commentElement.fadeOut(300, function() {
          $(this).remove();

          // コメント数を更新
          const remainingComments = $('.comment-item').length;
          $('.badge.bg-secondary').text(remainingComments);

          // コメントがなくなった場合はメッセージを表示
          if (remainingComments === 0) {
            $('#comments-container').html(`
              <div class="alert alert-secondary">
                まだコメントがありません。最初のコメントを投稿してみましょう！
              </div>
            `);
          }
        });
      } else {
        alert('エラーが発生しました: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('コメントの削除に失敗しました');
    }
  });
});
