CREATE TABLE session (
  session_id   CHAR(26)      NOT NULL,                     -- UUID v7 등
  token_hash   CHAR(64)      NOT NULL,                     -- SHA-256 hex
  user_id      INT UNSIGNED  NOT NULL,
  state        ENUM('active','revoked','expired') NOT NULL DEFAULT 'active',
  created_at   DATETIME(3)   NOT NULL,
  last_access_at DATETIME(3) NOT NULL,
  expires_at   DATETIME(3)   NOT NULL,

  CONSTRAINT PK_SESSION PRIMARY KEY (session_id),
  CONSTRAINT UQ_SESSION_TOKEN UNIQUE (token_hash),
  CONSTRAINT FK_SESSION_USER FOREIGN KEY (user_id) REFERENCES user(user_id),

  INDEX IX_SESSION_EXPIRES (expires_at),
  INDEX IX_SESSION_USER_STATE (user_id, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
