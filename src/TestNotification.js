// src/TestNotifications.js - Enhanced testing component
import React, { useState, useEffect } from 'react';
import { fetchData, postData } from './utils';

function TestNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [tabView, setTabView] = useState('create'); // 'create' or 'list'
  const [result, setResult] = useState(null);

  // Form data states
  const [subject, setSubject] = useState('Test Notification');
  const [content, setContent] = useState('<p>This is a test notification from the thesis management system.</p>');
  const [targetType, setTargetType] = useState('specific');
  
  // Target criteria states
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState('');
  const [departmentId, setDepartmentId] = useState('MCST');
  const [program, setProgram] = useState('');
  const [thesisCycleId, setThesisCycleId] = useState('');
  
  // Scheduling state
  const [scheduled, setScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  // Timezone information
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const utcOffset = -now.getTimezoneOffset() / 60; // Convert to hours
  const utcOffsetStr = (utcOffset >= 0 ? '+' : '') + utcOffset;
  const formatDateWithTz = (date) => {
    return `${date.toLocaleString()} (${browserTimezone})`;
  };

  const toUtcIsoString = (localDate) => {
    console.log('Converting local date to UTC ISO string:');
    console.log('- Input local date:', localDate.toLocaleString());
    console.log('- Local timezone:', browserTimezone);
    console.log('- UTC date:', localDate.toUTCString());
    const isoString = localDate.toISOString();
    console.log('- ISO string result:', isoString);
    return isoString;
  };
  
  // Available departments for testing
  const departments = [
    { id: 'MCST', name: 'Computer Science & IT' },
    { id: '1', name: 'Mathematics' },
    { id: 'PHYS', name: 'Physics' }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchData('notifications');
      console.log('Loaded notifications:', data);
      setNotifications(data.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setResult({
        success: false,
        message: 'Failed to load notifications: ' + (error.message || 'Unknown error')
      });
    } finally {
      setLoading(false);
    }
  };

  const setNotificationDefaults = (type) => {
    setTargetType(type);
    
    // Set default subject based on target type
    switch (type) {
      case 'student':
        setSubject('Important Notification for Students');
        setContent('<p>This is a test notification for all students in the selected department.</p>');
        break;
      case 'teacher':
        setSubject('Faculty Announcement');
        setContent('<p>This is a test notification for all teachers in the selected department.</p>');
        break;
      case 'department':
        setSubject('Department Heads Meeting');
        setContent('<p>This is a test notification for department heads.</p>');
        break;
      case 'thesis_cycle':
        setSubject('Thesis Cycle Announcement');
        setContent('<p>This is a test notification for all participants in the selected thesis cycle.</p>');
        break;
      default:
        setSubject('Test Notification');
        setContent('<p>This is a test notification.</p>');
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setSendingNotification(true);
    setResult(null);
    
    try {
      // Prepare target criteria based on target type
      let targetCriteria = {};
      
      switch (targetType) {
        case 'specific':
          // Parse comma-separated emails, trim whitespace
          targetCriteria.emails = emails.split(',').map(email => email.trim()).filter(email => email);
          break;
        case 'student':
          targetCriteria.dep_id = departmentId;
          if (program) {
            targetCriteria.program = program;
          }
          break;
        case 'teacher':
          targetCriteria.dep_id = departmentId;
          break;
        case 'department':
          targetCriteria.dep_id = departmentId;
          break;
        case 'thesis_cycle':
          targetCriteria.thesis_cycle_id = thesisCycleId;
          break;
      }
      
      // Prepare payload
      const payload = {
        subject,
        content,
        target_type: targetType,
        target_criteria: targetCriteria
      };
      
      // Add scheduled time if specified
      if (scheduled && scheduledTime) {
        // Create a Date object from the local time input
        const scheduledDate = new Date(scheduledTime);
        
        // Convert to ISO string (which includes timezone info as UTC)
        // This is the format the backend expects
        payload.scheduled_at = scheduledDate.toISOString();
      }
      
      console.log('Creating notification with payload:', payload);
      
      const response = await postData('notifications', payload);
      console.log('Notification created:', response);
      
      setResult({
        success: true,
        message: 'Notification created successfully!',
        data: response
      });
      
      // Reload notifications list
      loadNotifications();
      
      // Show the list view after successful creation
      setTabView('list');
    } catch (error) {
      console.error('Failed to create notification:', error);
      setResult({
        success: false,
        message: 'Failed to create notification: ' + (error.message || 'Unknown error'),
        error
      });
    } finally {
      setSendingNotification(false);
    }
  };

  const handleSendNow = async (id) => {
    try {
      console.log('Sending notification:', id);
      await postData(`notifications/${id}/send`);
      loadNotifications();
      setResult({
        success: true,
        message: 'Notification sent successfully!'
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      setResult({
        success: false,
        message: 'Failed to send notification: ' + (error.message || 'Unknown error')
      });
    }
  };

  const handleCancel = async (id) => {
    try {
      console.log('Cancelling notification:', id);
      await postData(`notifications/${id}/cancel`);
      loadNotifications();
      setResult({
        success: true,
        message: 'Notification cancelled successfully!'
      });
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      setResult({
        success: false,
        message: 'Failed to cancel notification: ' + (error.message || 'Unknown error')
      });
    }
  };

  // Set default scheduled time (5 minutes from now)
  const setDefaultScheduledTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    
    // Format as local datetime string (YYYY-MM-DDThh:mm)
    setScheduledTime(now.toISOString().slice(0, 16));
    setScheduled(true);
    
    // Debug timezone information
    console.log('Current timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('Offset from UTC (minutes):', now.getTimezoneOffset());
    console.log('Local time:', now.toLocaleString());
    console.log('UTC time:', now.toUTCString());
    console.log('ISO string (with timezone):', now.toISOString());
  };

  // Navigation tabs
  const renderTabs = () => (
    <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setTabView('create')}
          style={{
            padding: '10px 20px',
            background: tabView === 'create' ? '#4a90e2' : '#f5f5f5',
            color: tabView === 'create' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer'
          }}
        >
          Create Notification
        </button>
        <button
          onClick={() => setTabView('list')}
          style={{
            padding: '10px 20px',
            background: tabView === 'list' ? '#4a90e2' : '#f5f5f5',
            color: tabView === 'list' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer'
          }}
        >
          Notifications List
        </button>
      </div>
    </div>
  );

  // Create notification form
  const renderCreateForm = () => (
    <form onSubmit={handleCreateNotification}>
      <h2>Create Test Notification</h2>
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
        <p><strong>Browser Timezone:</strong> {browserTimezone} (UTC{utcOffsetStr})</p>
        <p><strong>Current Browser Time:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Current Time in ISO Format:</strong> {new Date().toISOString()}</p>
      </div>
      
      {/* Target Type Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Target Type:</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['specific', 'student', 'teacher', 'department', 'thesis_cycle'].map(type => (
            <button
              type="button"
              key={type}
              onClick={() => setNotificationDefaults(type)}
              style={{
                padding: '8px 16px',
                background: targetType === type ? '#4a90e2' : '#f5f5f5',
                color: targetType === type ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Target Criteria Fields - Conditionally rendered based on target type */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
          Target Criteria for {targetType.charAt(0).toUpperCase() + targetType.slice(1).replace('_', ' ')}:
        </label>
        
        {targetType === 'specific' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email Addresses (comma-separated):</label>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              style={{ width: '100%', padding: '8px', minHeight: '80px', marginBottom: '10px' }}
              placeholder="email1@example.com, email2@example.com"
              required
            />
          </div>
        )}
        
        {['student', 'teacher', 'department'].includes(targetType) && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Department:</label>
            <select 
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              required
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name} ({dept.id})</option>
              ))}
            </select>
          </div>
        )}
        
        {targetType === 'student' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Program (optional):</label>
            <input
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              placeholder="E.g., Computer Science"
            />
          </div>
        )}
        
        {targetType === 'thesis_cycle' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Thesis Cycle ID:</label>
            <input
              type="text"
              value={thesisCycleId}
              onChange={(e) => setThesisCycleId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              placeholder="E.g., 1"
              required
            />
          </div>
        )}
      </div>
      
      {/* Notification Content */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Subject:</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
          required
        />
        
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content (HTML):</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: '100%', padding: '8px', minHeight: '150px' }}
          required
        />
      </div>
      
      {/* Scheduling Options */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Scheduling:</label>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setScheduled(false)}
            style={{
              padding: '8px 16px',
              background: !scheduled ? '#4a90e2' : '#f5f5f5',
              color: !scheduled ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Send Immediately
          </button>
          <button
            type="button"
            onClick={() => setDefaultScheduledTime()}
            style={{
              padding: '8px 16px',
              background: scheduled ? '#4a90e2' : '#f5f5f5',
              color: scheduled ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Schedule for Later
          </button>
        </div>
        
        {scheduled && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Scheduled Time:</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              required={scheduled}
            />
            <p style={{ fontSize: '14px', color: '#666' }}>
              The notification will be sent at the scheduled time when the scheduler runs.
            </p>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={sendingNotification}
        style={{
          padding: '10px 20px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: sendingNotification ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {sendingNotification ? 'Creating...' : 'Create Notification'}
      </button>
    </form>
  );

  // Notifications list
  const renderNotificationsList = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Notifications List</h2>
        <button
          onClick={loadNotifications}
          style={{
            padding: '8px 16px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh List
        </button>
      </div>
      
      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Subject</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Scheduled</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Created</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(notification => (
              <tr key={notification.id}>
                <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>{notification.id}</td>
                <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>{notification.subject}</td>
                <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    background: 
                      notification.status === 'sent' ? '#4CAF50' :
                      notification.status === 'pending' ? '#FFC107' :
                      notification.status === 'scheduled' ? '#9C27B0' :
                      notification.status === 'failed' ? '#F44336' :
                      '#607D8B'
                  }}>
                    {notification.status}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>{notification.target_type}</td>
                <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  {notification.scheduled_at ? new Date(notification.scheduled_at).toLocaleString() : 'N/A'}
                </td>
                <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  {new Date(notification.created_at).toLocaleString()}
                </td>
                <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  {['pending', 'scheduled'].includes(notification.status) && (
                    <button
                      onClick={() => handleSendNow(notification.id)}
                      style={{
                        padding: '5px 10px',
                        marginRight: '5px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Send Now
                    </button>
                  )}
                  
                  {notification.status === 'scheduled' && (
                    <button
                      onClick={() => handleCancel(notification.id)}
                      style={{
                        padding: '5px 10px',
                        background: '#F44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Email Notification System Test</h1>
      
      {/* Result message */}
      {result && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '5px',
          background: result.success ? '#DFF2BF' : '#FFBABA',
          color: result.success ? '#4F8A10' : '#D8000C'
        }}>
          <p style={{ margin: 0 }}><strong>{result.message}</strong></p>
          {result.data && (
            <pre style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', overflow: 'auto', maxHeight: '200px' }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      {/* Navigation tabs */}
      {renderTabs()}
      
      {/* Content based on active tab */}
      <div style={{ padding: '20px', background: 'white', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {tabView === 'create' ? renderCreateForm() : renderNotificationsList()}
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
        <h3>Spam Prevention Tips</h3>
        <p>If your test emails are going to spam, try these fixes:</p>
        <ul>
          <li><strong>Use a reputable email service</strong> like SendGrid, Mailgun, or AWS SES</li>
          <li><strong>Implement SPF, DKIM, and DMARC</strong> for email authentication</li>
          <li><strong>Use a professional subject line</strong> without spam triggers</li>
          <li><strong>Avoid excessive links</strong> and keep content balanced between text and HTML</li>
          <li><strong>Include unsubscribe options</strong> in all emails</li>
        </ul>
      </div>
    </div>
  );
}

export default TestNotifications;