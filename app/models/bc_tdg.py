from . import db
from .nganh import Nganh

class BCTDG(db.Model):
    __tablename__ = 'bc_tdg'

    ma_bc_tdg = db.Column(db.String(50), primary_key=True, nullable=False)
    ma_nganh = db.Column(db.Integer, db.ForeignKey('nganh.ma_nganh', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    url = db.Column(db.Text, nullable=False)

    nganh = db.relationship('Nganh', backref=db.backref('bc_tdg_list', lazy=True)) 

    def __init__(self, ma_bc_tdg, ma_nganh, url):
        self.ma_bc_tdg = ma_bc_tdg
        self.ma_nganh = ma_nganh
        self.url = url

    def __repr__(self):
        return f"<BCTDG(ma_bc_tdg={self.ma_bc_tdg}, ma_nganh={self.ma_nganh}, url={self.url})>"

