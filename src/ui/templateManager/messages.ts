import {
	Template,
	TemplateValidationError,
} from "../../domain/models/template";

export type WebviewToHostMessage =
	| { type: "request-init" }
	| { type: "save-template"; payload: Template }
	| { type: "delete-template"; payload: { id: string } }
	| { type: "duplicate-template"; payload: { id: string } }
	| { type: "set-default"; payload: { id: string } }
	| { type: "request-preview"; payload: Template };

export type HostToWebviewMessage =
	| {
			type: "init-data";
			payload: {
				templates: Template[];
				defaultTemplateId: string;
			};
	  }
	| {
			type: "template-saved";
			payload: { template: Template; templates: Template[] };
	  }
	| {
			type: "template-deleted";
			payload: {
				id: string;
				templates: Template[];
				defaultTemplateId: string;
			};
	  }
	| {
			type: "default-changed";
			payload: { defaultTemplateId: string };
	  }
	| {
			type: "preview-result";
			payload: { previewText: string };
	  }
	| {
			type: "validation-error";
			payload: { errors: TemplateValidationError[] };
	  }
	| {
			type: "notification";
			payload: { message: string; level: "info" | "error" | "success" };
	  };
