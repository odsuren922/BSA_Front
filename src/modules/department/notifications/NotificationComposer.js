import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Select, Button, DatePicker, notification, Spin, Card, Row, Col, Tabs, Alert } from "antd";
import { fetchData, postData } from "../../../utils";
import api from "../../../api/axios";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

function NotificationComposer({ onError }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [preview, setPreview] = useState({
    subject: "",
    content: ""
  });
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [validationErrors, setValidationErrors] = useState(null);

  // Enhanced error handling with retry support
  const fetchWithRetry = useCallback(async (endpoint, retries = 2) => {
    try {
      return await fetchData(endpoint);
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying ${endpoint}... (${retries} attempts left)`);
        return await fetchWithRetry(endpoint, retries - 1);
      }
      // If we're out of retries, propagate the error
      if (onError) onError(error);
      throw error;
    }
  }, [onError]);

  // Fetch templates and students with enhanced error handling
  useEffect(() => {
    const fetchTemplatesAndStudents = async () => {
      setLoading(true);
      setLoadingError(null);
      
      try {
        // First check if our API is available using a test request
        await api.get('/sanctum/csrf-cookie', { withCredentials: true })
          .catch(error => {
            console.log('CSRF cookie request (expected to fail in some configs):', error);
          });
          
        // Then attempt to fetch real data
        const [templateData, studentData] = await Promise.all([
          fetchWithRetry("notification-templates"),
          fetchWithRetry("students/all")
        ]);
        
        console.log('Templates loaded:', templateData);
        console.log('Students loaded:', studentData);
        
        setTemplates(templateData || []);
        setStudents(studentData || []);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoadingError(error.message || "Failed to load required data");
        
        // Let the parent component know about the error
        if (onError) onError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplatesAndStudents();
  }, [fetchWithRetry, onError]);

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    console.log('Selected template:', template);
    
    if (template) {
      form.setFieldsValue({
        subject: template.subject,
        content: template.body
      });
      updatePreview(template.subject, template.body, form.getFieldValue("data") || {});
    }
  };

  const handleContentChange = (e) => {
    updatePreview(
      form.getFieldValue("subject"),
      e.target.value,
      form.getFieldValue("data") || {}
    );
  };

  const handleSubjectChange = (e) => {
    updatePreview(
      e.target.value,
      form.getFieldValue("content"),
      form.getFieldValue("data") || {}
    );
  };

  const updatePreview = (subject, content, data) => {
    // Simple placeholder replacement for preview
    let previewSubject = subject || "";
    let previewContent = content || "";

    // Replace placeholders with data values or placeholder text
    Object.keys(data || {}).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewSubject = previewSubject.replace(regex, data[key]);
      previewContent = previewContent.replace(regex, data[key]);
    });

    // For placeholders without data, show them in a different style
    previewSubject = previewSubject.replace(/{{(\w+)}}/g, '<span style="color: #ff4d4f">[[$1]]</span>');
    previewContent = previewContent.replace(/{{(\w+)}}/g, '<span style="color: #ff4d4f">[[$1]]</span>');

    setPreview({
      subject: previewSubject,
      content: previewContent
    });
  };

  const getFilteredRecipients = () => {
    switch(recipientFilter) {
      case "confirmed":
        return students.filter(student => student.is_choosed);
      case "unconfirmed":
        return students.filter(student => !student.is_choosed);
      default:
        return students;
    }
  };

  // Direct API call for better error handling
  const sendNotification = async (data, endpoint) => {
    setValidationErrors(null);
    
    try {
      console.log(`Sending to ${endpoint}:`, data);
      
      const response = await api.post(`/api/${endpoint}`, data);
      console.log('API response:', response);
      
      return response.data;
    } catch (error) {
      console.error('API error:', error);
      
      // Extract validation errors if available
      if (error.response && error.response.status === 422 && error.response.data) {
        console.log('Validation errors:', error.response.data);
        
        if (error.response.data.errors) {
          setValidationErrors(error.response.data.errors);
        } else if (error.response.data.message) {
          setValidationErrors({ general: [error.response.data.message] });
        }
      }
      
      throw error;
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    setValidationErrors(null);
    
    try {
      console.log('Form values:', values);
      
      // Determine recipients based on selection
      let selectedRecipients = [];
      
      if (values.sendToAll) {
        // Send to all based on filter
        selectedRecipients = getFilteredRecipients().map(student => ({
          id: student.id,
          email: student.mail,
          data: {
            student_name: student.firstname,
            // Add other student-specific data
          }
        }));
      } else if (values.recipients && values.recipients.length > 0) {
        // Send to selected recipients
        selectedRecipients = values.recipients.map(id => {
          const student = students.find(s => s.id === id);
          return {
            id: student.id,
            email: student.mail,
            data: {
              student_name: student.firstname,
              // Add other student-specific data
            }
          };
        });
      } else {
        notification.error({
          message: "Error",
          description: "Please select at least one recipient or choose to send to all."
        });
        setLoading(false);
        return;
      }

      console.log('Selected recipients:', selectedRecipients);

      // Prepare template or direct data
      let apiEndpoint, requestData;
      
      if (values.template_id) {
        // Using a template
        apiEndpoint = "notifications/template";
        requestData = {
          template_id: values.template_id,
          recipients: selectedRecipients,
          data: values.data || {},
          schedule: values.schedule ? values.schedule.format() : null,
          url: values.url
        };
      } else {
        // Using direct content
        apiEndpoint = "notifications";
        requestData = {
          recipients: selectedRecipients,
          title: values.subject,
          content: values.content,
          schedule: values.schedule ? values.schedule.format() : null,
          url: values.url,
          send_email: true,
          send_push: true
        };
      }

      await sendNotification(requestData, apiEndpoint);

      notification.success({
        message: "Success",
        description: "Notification sent successfully!"
      });

      form.resetFields();
      setPreview({ subject: "", content: "" });
    } catch (error) {
      console.error("Error sending notification:", error);
      
      // Only show a generic error if we don't already have validation errors displayed
      if (!validationErrors) {
        notification.error({
          message: "Error",
          description: "Failed to send notification: " + (error.message || "Unknown error")
        });
      }
      
      // Notify the parent component about the error
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  const saveToDraft = async () => {
    try {
      notification.success({
        message: "Success",
        description: "Draft saved successfully!"
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      notification.error({
        message: "Error",
        description: "Failed to save draft."
      });
    }
  };
  
  const renderLoadingError = () => {
    if (!loadingError) return null;
    
    return (
      <Alert
        message="Error Loading Data"
        description={
          <>
            <p>{loadingError}</p>
            <p>This might be due to CORS issues or the API server being unavailable.</p>
            <Button 
              onClick={() => window.location.reload()}
              type="primary" 
              size="small"
            >
              Refresh Page
            </Button>
          </>
        }
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  };

  const renderValidationErrors = () => {
    if (!validationErrors) return null;

    const errorMessages = [];
    
    // Process the validation errors object
    for (const field in validationErrors) {
      if (Array.isArray(validationErrors[field])) {
        validationErrors[field].forEach(message => {
          errorMessages.push(`${field}: ${message}`);
        });
      }
    }

    return (
      <Alert
        message="Validation Error"
        description={
          <ul className="list-disc pl-5">
            {errorMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        }
        type="error"
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />
    );
  };

  return (
    <Spin spinning={loading} tip="Loading...">
      {renderLoadingError()}
      {renderValidationErrors()}
      
      <Form
        form={form}
        name="proposeTopicForm"
        onFinish={onFinish}
        layout="vertical"
      >
        <Row
          justify="end"
          gutter={16}
          style={{ marginBottom: "16px", marginTop: "16px" }}
        >
          <Col>
            <Button onClick={saveToDraft}>Save as Draft</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              Send
            </Button>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={16}>
            <Card title="Notification Content" bordered={false}>
              <Form.Item
                label="Template"
                name="template_id"
              >
                <Select 
                  placeholder="Select a template" 
                  onChange={handleTemplateChange}
                  allowClear
                >
                  {templates.map(template => (
                    <Option key={template.id} value={template.id}>
                      {template.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: "Please enter a subject" }]}
              >
                <Input 
                  placeholder="Notification subject" 
                  onChange={handleSubjectChange}
                />
              </Form.Item>

              <Form.Item
                label="Content"
                name="content"
                rules={[{ required: true, message: "Please enter notification content" }]}
              >
                <TextArea 
                  rows={8} 
                  placeholder="Notification content"
                  onChange={handleContentChange}
                />
              </Form.Item>

              <Form.Item
                label="Dynamic Data"
                name="data"
              >
                <Card size="small" title="Variable Values (Optional)">
                  <p className="text-gray-500 mb-2 text-sm">
                    Enter values for placeholders in your template or content.
                  </p>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name={["data", "submission_deadline"]}>
                        <Input placeholder="submission_deadline" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name={["data", "days_remaining"]}>
                        <Input placeholder="days_remaining" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name={["data", "deadline_type"]}>
                        <Input placeholder="deadline_type" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name={["data", "due_date"]}>
                        <Input placeholder="due_date" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Form.Item>

              <Form.Item
                label="URL (Optional)"
                name="url"
              >
                <Input placeholder="Link to include in notification" />
              </Form.Item>

              <Form.Item
                label="Schedule (Optional)"
                name="schedule"
              >
                <DatePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="Select time to send notification"
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Recipients" bordered={false}>
              <Form.Item name="sendToAll" valuePropName="checked">
                <div className="mb-4">
                  <Tabs defaultActiveKey="all" onChange={setRecipientFilter}>
                    <TabPane tab="All Students" key="all" />
                    <TabPane tab="With Confirmed Topics" key="confirmed" />
                    <TabPane tab="Without Confirmed Topics" key="unconfirmed" />
                  </Tabs>
                  <Button 
                    type="primary" 
                    onClick={() => form.setFieldsValue({ sendToAll: true, recipients: [] })}
                    className="mt-2"
                  >
                    {`Send to All ${getFilteredRecipients().length} Students`}
                  </Button>
                </div>
              </Form.Item>

              <div className="mb-2 font-medium">Or select specific recipients:</div>
              <Form.Item
                name="recipients"
              >
                <Select
                  mode="multiple"
                  placeholder="Select recipients"
                  style={{ width: "100%" }}
                  optionFilterProp="children"
                  showSearch
                  onSelect={() => form.setFieldsValue({ sendToAll: false })}
                >
                  {students.map(student => (
                    <Option key={student.id} value={student.id}>
                      {student.lastname || ''} {student.firstname || ''} ({student.program || 'Unknown'})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>

            <Card title="Preview" bordered={false} className="mt-4">
              <div className="mb-2 font-medium">Subject:</div>
              <div 
                className="mb-4 p-2 border rounded bg-gray-50"
                dangerouslySetInnerHTML={{ __html: preview.subject }}
              />
              
              <div className="mb-2 font-medium">Content:</div>
              <div 
                className="p-2 border rounded bg-gray-50 whitespace-pre-wrap"
                style={{ maxHeight: '200px', overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: preview.content }}
              />
            </Card>
          </Col>
        </Row>

        <Form.Item className="mt-4">
          <Button type="primary" htmlType="submit" size="large">
            Send Notification
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
}

export default NotificationComposer;