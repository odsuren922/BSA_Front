<?php

use App\Models\ProposalForm;
use App\Http\Controllers\ProposalFormController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\SupervisorController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\TopicDetailController;
use App\Http\Controllers\TopicRequestController;
use App\Http\Controllers\TopicResponseController;

//department
Route::get('/proposalform', [ProposalFormController::class, 'index']);
Route::post('/proposalform', [ProposalFormController::class, 'update']);
Route::get('/students/all', [StudentController::class, 'index']);

//student
Route::post('/topic/store', [TopicController::class, 'storestudent']);
Route::post('/topic-requests', [TopicRequestController::class, 'store']);
Route::get('/topics/draftstudent', [TopicController::class, 'getDraftTopicsByStudent']);
Route::get('/topics/draftteacher', [TopicController::class, 'getDraftTopicsByTeacher']);
Route::get('/topic_confirmed', [TopicRequestController::class, 'getConfirmedTopicOnStudent']);
Route::get('/topics/checkedtopics', [TopicController::class, 'getCheckedTopics']);
Route::get('/teacher/{id}', [TeacherController::class, 'show']);
Route::get('/department/{id}', [DepartmentController::class, 'show']);
Route::get('/topic_requests_teacher', [TopicRequestController::class, 'getRequestedTopicByTeacher']);

//supervisor
Route::get('/topics/submittedby/{type}', [TopicController::class, 'getSubmittedTopicsByType']);
Route::post('/topic-response', [TopicResponseController::class, 'store']);
Route::get('/topics/reviewedtopicList', [TopicController::class, 'getRefusedOrApprovedTopics']);


//teacher
Route::post('/topic/storeteacher', [TopicController::class, 'storeteacher']);
Route::post('/topic-requestsbyteacher', [TopicRequestController::class, 'storebyteacher']);
Route::get('/api/department', [DepartmentController::class, 'index']);
Route::get('/topic_requests', [TopicRequestController::class, 'index']);
Route::post('/topic_confirm', [TopicController::class, 'confirmTopic']);
Route::post('/topic_decline', [TopicController::class, 'declineTopic']);
Route::get('/topics_confirmed', [TopicRequestController::class, 'getConfirmedTopics']);
Route::get('/topics/checkedtopicsbystud', [TopicController::class, 'getCheckedTopicsByStud']);

//default
Route::get('/topics/topiclistproposedbyuser', [TopicController::class, 'getTopicListProposedByUser']);
